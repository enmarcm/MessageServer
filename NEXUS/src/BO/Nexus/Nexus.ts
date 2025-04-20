import GrpcClient from "../../utils/GrpcClient";
import {
  ConstructorNexusData,
  Content,
  EmailContent,
  NexusDataType,
  NexusQueType,
  ServerDataType,
  SMSContent,
} from "./NexusTypes";
import { logger, ITSGooseHandler } from "../../data/instances";
import SelectionHandler from "./SelectionHandler";
import DistributedRPCHandler from "./DistributedRPCHandler";
import config from "../../config.json";
import { QueueItemModel } from "../TGoose/models";
import { SMSNumber } from "../../constants";
import { logHistory } from "../LogHistory/LogHistory";

export default class Nexus {
  public que: NexusQueType[];
  public data: NexusDataType[];
  public servers: ServerDataType[];
  public grpcClientsMap: Map<any, { bo: GrpcClient; data: GrpcClient }>;
  private selectionHandler: SelectionHandler;
  private rpcHandler: DistributedRPCHandler;
  private isProcessing: boolean;
  private bounceQueue: { from: string; to: string; server: ServerDataType; queueItemId: string }[];
  private isProcessingBounces: boolean;

  constructor({ data, servers }: ConstructorNexusData) {
    this.que = [];
    this.data = data;
    this.servers = servers;
    this.selectionHandler = new SelectionHandler(this.data, this.servers);
    this.rpcHandler = new DistributedRPCHandler(this.servers);
    this.grpcClientsMap = this.rpcHandler.grpcClientsMap;
    this.isProcessing = false;
    this.bounceQueue = [];
    this.isProcessingBounces = false;

    setInterval(
      this.checkDatabaseForPendingItems,
      config.Nexus.intervalToCheckDataBaseNexus
    );
  }

  public addQue = async (item: NexusQueType): Promise<void> => {
    await ITSGooseHandler.addDocument({
      Model: QueueItemModel,
      data: item,
    });
  };

  private checkDatabaseForPendingItems = async (): Promise<void> => {
    try {
      const pendingItems = await ITSGooseHandler.searchAll<NexusQueType>({
        Model: QueueItemModel,
        condition: { status: "PENDING" },
      });

      for (const item of pendingItems) {
        this.que.push(item);

        if (!item?.id) {
          logger.error("Item without id");
          continue;
        }

        await ITSGooseHandler.editDocument({
          Model: QueueItemModel,
          id: item.id.toString(),
          newData: { status: "PROCESSING" },
        });
      }

      this.processQueue();
    } catch (error) {
      logger.error(`Error checking database for pending items: ${error}`);
    }
  };

  private processQueue = async (): Promise<void> => {
    if (this.isProcessing) return; // Evitar múltiples ejecuciones simultáneas
    this.isProcessing = true;

    try {
      while (this.que.length > 0) {
        const item = this.que.shift();
        if (item && item.id) {
          await this.sendItem(item);
        }
      }
    } catch (error) {
      logger.error(`Error processing queue: ${error}`);
    } finally {
      this.isProcessing = false;

      // Si no hay más elementos en la cola principal, procesar los rebotes
      if (this.bounceQueue.length > 0) {
        this.processBounceQueue();
      }
    }
  };

  private async sendItem(item: NexusQueType): Promise<void> {
    const sendMethod = item.type === "EMAIL" ? "sendMail" : "sendSMS";

    const { content }: { content: Content } = item;

    if (!content?.to || !content?.body) return;

    await (this as any)[sendMethod](content, item.id);
  }

  public sendMail = async (
    content: EmailContent,
    queueItemId: string
  ): Promise<void> => {
    const { to, body, subject } = content;
    if (!to || !body || !subject) return;

    if (!this.isValidEmail(to)) return;

    let serverToUse: ServerDataType | null = null;
    let mailToUse: NexusDataType | null = null;

    try {
      serverToUse = await this.selectionHandler.selectServer(
        this.grpcClientsMap,
        "EMAIL"
      );
      mailToUse = await this.selectionHandler.selectMail();

      const contentMapped = {
        from: mailToUse.content.toString(),
        to,
        subject,
        body,
      };

      await new Promise<void>((resolve, reject) => {
        this.grpcClientsMap
          .get(serverToUse)
          ?.bo.invokeMethod("SendMail", contentMapped, (err, response) => {
            if (err) {
              logger.error(err);
              reject(err);
            } else {
              logger.log(`Mail sent: ${JSON.stringify(response)}`);
              resolve();
            }
          });
      });

      logger.log(`Sending email to ${to} with subject ${subject} and Body`);

      // Agregar a la cola de rebotes para verificar después de 10 segundos
      setTimeout(() => {

        if(mailToUse === null || serverToUse === null) return;

        this.bounceQueue.push({
          from: mailToUse.content.toString(),
          to,
          server: serverToUse,
          queueItemId,
        });
        if (!this.isProcessing) {
          this.processBounceQueue();
        }
      }, 10000);

      logHistory.logEmailActivity(
        mailToUse.content as string,
        to,
        subject,
        "PROCESSING"
      );

      await ITSGooseHandler.editDocument({
        Model: QueueItemModel,
        id: queueItemId,
        newData: { from: mailToUse.content.toString(), status: "PROCESSING" },
      });
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      await ITSGooseHandler.editDocument({
        Model: QueueItemModel,
        id: queueItemId,
        newData: { status: "ERROR" },
      });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
      if (mailToUse) {
        this.markMailAsActive(mailToUse);
      }
    }
  };

  private processBounceQueue = async (): Promise<void> => {
    if (this.isProcessing || this.isProcessingBounces) return; // Priorizar la cola principal
    if (this.bounceQueue.length === 0) return;
  
    this.isProcessingBounces = true;
  
    try {
      while (this.bounceQueue.length > 0) {
        const bounceItem = this.bounceQueue.shift();
        if (bounceItem) {
          const { from, to, server, queueItemId } = bounceItem;
          const bounceStatus = await this.verifyBounceStatus(from, to, server);

          // Verificar el estado actual en la base de datos antes de actualizar
          const currentItem = await ITSGooseHandler.searchOne<NexusQueType>({
            Model: QueueItemModel,
            //@ts-ignore
            condition: { _id: queueItemId } //TODO: Modificar,
          });
  
          if (!currentItem) {
            logger.error(`Queue item with ID ${queueItemId} not found.`);
            continue;
          }
  
          if (currentItem.status === "ERROR") {
            logger.log(`Queue item ${queueItemId} is already marked as ERROR. Skipping update.`);
            continue; // No actualizar si ya está en estado ERROR
          }
  
          if (bounceStatus === "failed") {
            logger.log(`Bounce detected for email to ${to}`);
            await ITSGooseHandler.editDocument({
              Model: QueueItemModel,
              id: queueItemId,
              newData: { status: "ERROR" },
            });
          } else if (bounceStatus === "completed") {
            logger.log(`Email to ${to} completed successfully`);
            await ITSGooseHandler.editDocument({
              Model: QueueItemModel,
              id: queueItemId,
              newData: { status: "COMPLETED" },
            });
          }
        }
      }
    } catch (error) {
      logger.error(`Error processing bounce queue: ${error}`);
    } finally {
      this.isProcessingBounces = false;
    }
  };

  private async verifyBounceStatus(
    from: string,
    to: string,
    serverToUse: ServerDataType
  ): Promise<string> {
    try {
      const request = {
        from,
        to,
        sent_time: new Date().toISOString(),
      };

      const bounceResponse = await new Promise<{
        status: string;
        reason: string;
      }>((resolve, reject) => {
        this.grpcClientsMap
          .get(serverToUse)
          ?.bo.invokeMethod("CheckBounceStatus", request, (err, response) => {
            if (err) {
              logger.error(`Error checking bounce status: ${err}`);
              reject(err);
            } else {
              resolve(response);
            }
          });
      });

      console.log("Bounce Response:", bounceResponse);

      return bounceResponse.status;
      
    } catch (error) {
      logger.error(`Error during bounce status check: ${error}`);
      return "failed";
    }
  }

  private markServerAsFree(server: ServerDataType): ServerDataType {
    const serverIndex = this.servers.findIndex((s) => s === server);

    if (serverIndex !== -1) this.servers[serverIndex].use = "FREE";

    return server;
  }

  private markMailAsActive(mailToUse: NexusDataType): void {
    const mailIndex = this.data.findIndex((m) => m === mailToUse);

    if (mailIndex !== -1) this.data[mailIndex].status = "ACTIVE";
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public sendSMS = async (
    content: SMSContent,
    queueItemId: string
  ): Promise<void> => {
    const { to, body } = content;
    if (!to || !body) return;

    let serverToUse: ServerDataType | null = null;

    try {
      serverToUse = await this.selectionHandler.selectServer(
        this.grpcClientsMap,
        "SMS"
      );

      const contentMapped = { to, message: body };

      await new Promise<void>((resolve, reject) => {
        this.grpcClientsMap
          .get(serverToUse)
          ?.bo.invokeMethod("SendSMS", contentMapped, (err, response) => {
            if (err) {
              logger.error(err);
              reject(err);
            } else {
              logger.log(`SMS sent: ${JSON.stringify(response)}`);
              resolve();
            }
          });
      });

      logger.log(`Sending SMS to ${to} with message ${body}`);
      logHistory.logSMSActivity(
        SMSNumber.mainNumber,
        to,
        body,
        "COMPLETED"
      );

      await ITSGooseHandler.editDocument({
        Model: QueueItemModel,
        id: queueItemId,
        newData: { from: SMSNumber.mainNumber, status: "COMPLETED" },
      });
    } catch (error) {
      logger.error(`Error sending SMS: ${error}`);
      await ITSGooseHandler.editDocument({
        Model: QueueItemModel,
        id: queueItemId,
        newData: { status: "ERROR" },
      });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
    }
  };
}