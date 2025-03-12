gitimport GrpcClient from "../../utils/GrpcClient";
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
import config from "../../config.json"
import {QueueItemModel} from "../TGoose/models"

/**
 * Nexus class to handle email and SMS sending operations.
 */
export default class Nexus {
  public que: NexusQueType[];
  public data: NexusDataType[];
  public servers: ServerDataType[];
  public grpcClientsMap: Map<any, { bo: GrpcClient; data: GrpcClient }>;
  private selectionHandler: SelectionHandler;
  private rpcHandler: DistributedRPCHandler;

  /**
   * Creates an instance of Nexus.
   * @param {ConstructorNexusData} param0 - The data and servers to initialize the Nexus instance.
   * @example
   * const nexus = new Nexus({
   *   data: [{ type: 'EMAIL', content: 'example@mail.com', status: 'INACTIVE', rest: 0, credentials: {} }],
   *   servers: [{ name: 'Server1', host: 'localhost', port: 8080, status: 'ACTIVE', use: 'FREE', typeInfo: 'EMAIL' }]
   * });
   */
  constructor({ data, servers }: ConstructorNexusData) {
    this.que = [];
    this.data = data;
    this.servers = servers;
    this.selectionHandler = new SelectionHandler(this.data, this.servers);
    this.rpcHandler = new DistributedRPCHandler(this.servers);
    this.grpcClientsMap = this.rpcHandler.grpcClientsMap;

    setInterval(this.checkDatabaseForPendingItems, config.Nexus.intervalToCheckDataBaseNexus);
  }

  /**
   * Adds an item to the queue and upload to DataBase.
   * @param {NexusQueType} item - The item to add to the queue.
   */
  public addQue = async (item: NexusQueType): Promise<void> => {
    await ITSGooseHandler.addDocument({
      Model: QueueItemModel,
      data: item,
    });
  };

  /**
   * Checks the database for pending items and adds them to the queue.
   * @private
   */
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

  /**
   * Processes the queue by sending the first item.
   * @private
   */
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

  /**
   * Sends an item based on its type (EMAIL or SMS).
   * @private
   * @param {NexusQueType} item - The item to send.
   */
  private async sendItem(item: NexusQueType): Promise<void> {
    const sendMethod = item.type === "EMAIL" ? "sendMail" : "sendSMS";

    const { content }: { content: Content } = item;

    if (!content?.to || !content?.body) return;

    await (this as any)[sendMethod](content);
  }

  /**
   * Sends an email.
   * @param {EmailContent} content - The email content.
   */
  public sendMail = async (content: EmailContent): Promise<void> => {
    const { to, body, subject } = content;
    if (!to || !body || !subject) return;

    if (!this.isValidEmail(to)) return;

    let serverToUse: ServerDataType | null = null;
    let mailToUse: NexusDataType | null = null;

    try {
      serverToUse = await this.selectionHandler.selectServer(
        this.grpcClientsMap
      );
      mailToUse = await this.selectionHandler.selectMail();

      const contentMapped = { from: mailToUse.content, to, subject, body };

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
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
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

  /**
   * Marks a server as free.
   * @private
   * @param {ServerDataType} server - The server to mark as free.
   * @returns {ServerDataType} The server marked as free.
   */
  private markServerAsFree(server: ServerDataType): ServerDataType {
    const serverIndex = this.servers.findIndex((s) => s === server);

    if (serverIndex !== -1) this.servers[serverIndex].use = "FREE";

    return server;
  }

  /**
   * Marks an email as active.
   * @private
   * @param {NexusDataType} mailToUse - The email to mark as active.
   */
  private markMailAsActive(mailToUse: NexusDataType): void {
    const mailIndex = this.data.findIndex((m) => m === mailToUse);

    if (mailIndex !== -1) this.data[mailIndex].status = "ACTIVE";
  }

  /**
   * Validates an email address.
   * @private
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sends an SMS.
   * @param {SMSContent} content - The SMS content.
   */
  public sendSMS = (_content: SMSContent): void => {
    // Implementar lógica para enviar SMS
  };

  /**
   * Sends logs.
   */
  public sendLogs = (): void => {
    // Implementar lógica para enviar logs
  };

  /**
   * Selects a number.
   * @private
   */
  //@ts-ignore
  private selectNumber = (): void => {
    // Implementar lógica para seleccionar números
  };

  // private configMail = (): void => {};
  // private configSMS = (): void => {};
  // private verifyStatus = (): void => {};
  // private verifyServers = (): void => {};
  // private verifySMS = (): void => {};
  // private verifyMail = (): void => {};
}
