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
import { EventEmitter } from "stream";
import { logger } from "../../data/instances";
import SelectionHandler from "./SelectionHandler";
import DistributedRPCHandler from "./DistributedRPCHandler";

/**
 * Nexus class to handle email and SMS sending operations.
 */
export default class Nexus {
  public que: NexusQueType[];
  public data: NexusDataType[];
  public servers: ServerDataType[];
  public grpcClientsMap: Map<any, { bo: GrpcClient; data: GrpcClient }>;
  private eventEmitter: EventEmitter;
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
    this.eventEmitter = new EventEmitter();
    this.selectionHandler = new SelectionHandler(this.data, this.servers);
    this.rpcHandler = new DistributedRPCHandler(this.servers);
    this.grpcClientsMap = this.rpcHandler.grpcClientsMap;

    this.eventEmitter.on("newItem", this.processQueue);
  }

  /**
   * Adds an item to the queue and emits a newItem event.
   * @param {NexusQueType} item - The item to add to the queue.
   */
  public addQue = (item: NexusQueType): void => {
    this.que.push(item);
    this.eventEmitter.emit("newItem");
  };

  /**
   * Processes the queue by sending the first item.
   * @private
   */
  private processQueue = async (): Promise<void> => {
    if (this.que.length > 0) {
      const item = this.que.shift();
      if (item) {
        await this.sendItem(item);
      }
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

    if (!this.isValidEmail(to)) return; //TODO: Aqui hay que crear un error

    let serverToUse: ServerDataType | null = null;
    let mailToUse: NexusDataType | null = null;

    try {
      // Verificar servidor libre y seleccionar
      serverToUse = await this.selectServer();
      // Verificar correo libre y seleccionar - Si no hay, se deja en la cola de nuevo
      mailToUse = this.selectMail();
      // Crear el objeto request con los datos necesarios
      const contentMapped = { from: mailToUse.content, to, subject, body };

      // Llamar al metodo de enviar correo mediante grpc
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

      // Devolver la informacion de si se envio o no y enviar a logs
      logger.log(`Sending email to ${to} with subject ${subject} and Body`);

      logger.log(`Sending email to ${to} with subject ${subject} and Body`);
    } catch (error) {
      // Devolvemos correo a la cola
      this.addQue({ type: "EMAIL", content });
    } finally {
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
      if (mailToUse) {
        this.markMailAsActive(mailToUse);
      }
    } finally {
      // Marcar el servidor como "FREE" después de enviar el correo o si ocurre un error
      if (serverToUse) {
        this.markServerAsFree(serverToUse);
      }
      // Marcar el correo como "ACTIVE" después de enviar el correo o si ocurre un error
      if (mailToUse) {
        this.markMailAsActive(mailToUse);
      }

      console.log(this.servers);
      console.log(this.data);
    }
  };

  /**
   * Helper method to mark a server as free.
   * @param {ServerDataType} server - The server to mark as free.
   * @returns {ServerDataType} - The server marked as free.
   */
  private markServerAsFree(server: ServerDataType): ServerDataType {
    const serverIndex = this.servers.findIndex((s) => s === server);

    if (serverIndex !== -1) this.servers[serverIndex].use = "FREE";

    return server;
  }

  //TODO: JSDOC
  private markMailAsActive(mailToUse: NexusDataType): void {
    const mailIndex = this.data.findIndex((m) => m === mailToUse);

    if (mailIndex !== -1) this.data[mailIndex].status = "ACTIVE";
  }

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