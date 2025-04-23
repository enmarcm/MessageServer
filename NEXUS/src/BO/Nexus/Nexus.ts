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
import fs from "fs";
import path from "path";

export default class Nexus {
  public que: NexusQueType[];
  public data: NexusDataType[];
  public servers: ServerDataType[];
  public grpcClientsMap: Map<any, { bo: GrpcClient; data: GrpcClient }>;
  private selectionHandler: SelectionHandler;
  private rpcHandler: DistributedRPCHandler;
  private isProcessing: boolean;
  private bounceQueue: {
    from: string;
    to: string;
    server: ServerDataType;
    queueItemId: string;
  }[];
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

  public addMultipleQue = async (items: NexusQueType[]): Promise<void> => {
    for (const item of items) {
      await this.addQue(item);
    }
  };

  private checkDatabaseForPendingItems = async (): Promise<void> => {
    try {
      // Actualizar los elementos a "PROCESSING" directamente en la base de datos
      const pendingItems = await ITSGooseHandler.searchAndUpdateMany<NexusQueType>({
        Model: QueueItemModel as any,
        condition: { status: "PENDING" },
        update: { status: "PROCESSING" },
      });
  
      logger.log("Pending items moved to PROCESSING:"+ pendingItems);
  
      for (const item of pendingItems) {
        if (!item?.id) {
          logger.error("Item without id");
          continue;
        }
  
        // Agregar el elemento a la cola
        this.que.push(item);
      }
  
      // Iniciar el procesamiento de la cola
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
        const item = this.que.shift(); // Obtener el siguiente elemento de la cola
        if (item && item.id) {
          try {
            // Procesar el elemento
            await this.sendItem(item);
          } catch (error) {
            logger.error(`Error processing item ${item.id}: ${error}`);
            // Reintroducir el elemento en la cola si no pudo ser procesado
            this.que.push(item);
          }
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
    const { to, body, subject, attachments } = content;
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

      if (!serverToUse || !mailToUse) {
        logger.log("No servers or mails available, marking as PENDING.");
        await ITSGooseHandler.editDocument({
          Model: QueueItemModel,
          id: queueItemId,
          newData: { status: "PENDING" },
        });
        return;
      }

      // Procesar los archivos adjuntos desde la carpeta uploads
      const processedAttachments = attachments?.map((attachment) => {
        const uploadsDir = path.resolve(__dirname, "../../../uploads");
        const filePath = path.join(uploadsDir, attachment.filename);

        console.log(`Checking file at path: ${filePath}`);

        if (!fs.existsSync(filePath)) {
          console.error(`File not found at path: ${filePath}`);
          throw new Error(`Attachment file not found: ${attachment.filename}`);
        }
        return {
          filename: attachment.filename,
          content: fs.readFileSync(filePath), // Leer el contenido del archivo
        };
      });

      const contentMapped = {
        from: mailToUse.content.toString(),
        to,
        subject,
        body,
        attachments: processedAttachments, // Adjuntar los archivos procesados
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
        if (mailToUse === null || serverToUse === null) return;

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
        newData: { status: "PENDING" }, // Mantener como PENDING
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

      if (!serverToUse) {
        logger.log("No servers available for SMS, marking as PENDING.");
        await ITSGooseHandler.editDocument({
          Model: QueueItemModel,
          id: queueItemId,
          newData: { status: "PENDING" },
        });
        return;
      }

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
      logHistory.logSMSActivity(SMSNumber.mainNumber, to, body, "COMPLETED");

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
        newData: { status: "PENDING" }, // Mantener como PENDING
      });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
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
            condition: { _id: queueItemId }, //TODO: Modificar,
          });

          if (!currentItem) {
            logger.error(`Queue item with ID ${queueItemId} not found.`);
            continue;
          }

          if (currentItem.status === "ERROR") {
            logger.log(
              `Queue item ${queueItemId} is already marked as ERROR. Skipping update.`
            );
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
              newData: { status: "COMPLETED" }, // Actualizar a COMPLETED
            });

            logHistory.logEmailActivity(
              from,
              to,
              currentItem.content.subject,
              "COMPLETED"
            );
          } else {
            // Si no se puede determinar el estado, reintroducir en la cola de rebotes
            this.bounceQueue.push(bounceItem);
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
}
