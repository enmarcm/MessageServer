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

  constructor({ data, servers }: ConstructorNexusData) {
    this.que = [];
    this.data = data;
    this.servers = servers;
    this.selectionHandler = new SelectionHandler(this.data, this.servers);
    this.rpcHandler = new DistributedRPCHandler(this.servers);
    this.grpcClientsMap = this.rpcHandler.grpcClientsMap;

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

        if (!item?.id) return logger.error("Item without id");

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
    try {
      if (this.que.length > 0) {
        const item = this.que.shift();
        if (item && item.id) {
          await this.sendItem(item);
          await ITSGooseHandler.editDocument({
            Model: QueueItemModel,
            id: item.id.toString(),
            newData: { status: "COMPLETED" },
          });
        }
      }
    } catch (error) {
      logger.error(`Error processing queue: ${error}`);
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
          ?.bo.invokeMethod(contentMapped, (err, response) => {
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

      console.log(mailToUse.content);

      logHistory.logEmailActivity(
        mailToUse.content as string,
        to,
        subject,
        "COMPLETED"
      );

      await ITSGooseHandler.editDocument({
        Model: QueueItemModel,
        id: queueItemId,
        newData: { from: mailToUse.content.toString(), status: "COMPLETED" },
      }).then(() => {
        logger.log(`Queue item ${queueItemId} updated to COMPLETED`);
      }).catch((err) => {
        logger.error(`Failed to update queue item ${queueItemId}: ${err}`);
      });
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      logHistory.logEmailActivity(
        mailToUse?.content?.toString() || "unknown",
        to,
        subject,
        "ERROR"
      );
      this.addQue({ type: "EMAIL", content, status: "PENDING" });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
      if (mailToUse) {
        this.markMailAsActive(mailToUse);
      }
    }
  };

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
          ?.bo.invokeMethod(contentMapped, (err, response) => {
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
      logHistory.logSMSActivity(SMSNumber.mainNumber, to, body, "ERROR");
      this.addQue({ type: "SMS", content, status: "PENDING" });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
    }
  };
}