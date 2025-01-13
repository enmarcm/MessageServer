import path from "path";
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

/**
 * Nexus class that handles the queue of items to be sent, data, and servers.
 */
export default class Nexus {
  /**
   * Queue of items to be sent.
   * @type {NexusQueType[]}
   */
  public que: NexusQueType[];

  /**
   * Data are the emails and numbers we currently handle, with their information.
   * @type {NexusDataType[]}
   */
  public data: NexusDataType[];

  /**
   * List of servers.
   * @type {ServerDataType[]}
   */
  public servers: ServerDataType[];

  /**
   * List of grpc clients.
   * @type {GrpcClient[]}
   */
  public grpcClients: Array<GrpcClient>;

  private eventEmitter: EventEmitter;

  /**
   * Constructor for the Nexus class.
   * @param {ConstructorNexusData} param0 - Object containing data and servers.
   */
  constructor({ data, servers }: ConstructorNexusData) {
    // Hay que hacer que cada vez que haya un elemento en cola, se detecte y se envie el email o mensaje segun el caso hasta que ya no queden elementos en cola
    this.que = [];
    this.data = data;
    this.servers = servers;
    this.grpcClients = [];
    this.eventEmitter = new EventEmitter();

    this.initGrpcClients();

    this.eventEmitter.on("newItem", this.processQueue);
  }

  // Este metodo se encarga de instanciar a todos los servidores gRPC
  private initGrpcClients = () => {
    //{} Esto hay que pasarlo por una variable de entorno mejor
    const PATH_PROTO = path.join(__dirname, "./mail.proto");

    const GRPC_CLIENTS = this.servers.map((server: any) => {
      return new GrpcClient({
        protoPath: PATH_PROTO,
        packageName: this.getPackageName(server.typeInfo),
        serviceName: this.getServiceName(server.typeInfo),
        methodName: this.getMethodName(server.typeInfo),
        target: `${server.host}:${server.port}`,
      });
    });

    this.grpcClients = GRPC_CLIENTS;
  };

  private getPackageName = (typeInfo: string) =>
    typeInfo === "SMS" ? "sms" : "mail";
  private getServiceName = (typeInfo: string) =>
    typeInfo === "SMS" ? "SMSService" : "MailService";
  private getMethodName = (typeInfo: string) =>
    typeInfo === "SMS" ? "SendSMS" : "SendMail";

  public addQue = (item: NexusQueType): void => {
    this.que.push(item);
    this.eventEmitter.emit("newItem");
  };

  private processQueue = (): void => {
    if (this.que.length > 0) {
      const item = this.que.shift();
      if (item) {
        this.sendItem(item);
      }
    }
  };

  private sendItem(item: NexusQueType): void {
    const sendMethod = item.type === "EMAIL" ? "sendMail" : "sendSMS";

    const { content }: { content: Content } = item;

    if (!content?.to || !content?.body) return;

    (this as any)[sendMethod](content);
  }

  /**
   * Method to send emails.
   */
  public sendMail = async (content: EmailContent): Promise<void> => {
    const { to, body, subject } = content;
    if (!to || !body || !subject) return; //TODO: Aqui hay que hacer un error

    if (!this.isValidEmail(to)) return; //TODO: Aqui hay que crear un error

    try {
      //? Verificar servidor libre y seleccionar
      const serverToUse = await this.selectServer();
      //? Verificar correo libre y seleccionar - Si no hay, se deja en la cola de nuevo
      const mailToUse = this.selectMail();

      //? Llamar al metodo de enviar correo mediante grpc

      //{Aqui debemos invocar

      //? Devolver la informacion de si se envio o no  y enviar a logs
      logger.log(`Sending email to ${to} with subject ${subject} and Body`);
    } catch (error) {
      //Devolvemos correo a la cola
      this.addQue({ type: "EMAIL", content });
    }
  };

  /**
   * Method to validate an email address.
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, false otherwise.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Method to send SMS.
   */
  public sendSMS = (content: SMSContent): void => {
    //! Verificar servidor libre y seleccionar
    //! Verificar numero libre y seleccionar
    //! Llamar l metodo de enviar SMS mediante grpc
    // ! Devolver la informacion de si se envio o no
  };

  /**
   * Method to send logs.
   */
  public sendLogs = (): void => {
    // !Por parametro hay que pasar la informacion
    // !Enviar a la BDD o al servicio para que cargue los logs
  };

  /**
   * Private method to select emails.
   */
  private selectMail = (): NexusDataType => {
    // Filtrar los elementos que tienen el estado ACTIVE y rest mayor a 0
    const activeMails = this.data.filter(
      (item) => item.status === "ACTIVE" && item.rest > 0
    );

    if (activeMails.length === 0) {
      logger.error("No active mails available");
      throw new Error("No active mails available"); //TODO: CREAR ERROR CUSTOM
    }

    // Seleccionar el elemento con el mayor valor de rest
    const selectedMail = activeMails.reduce((prev, curr) =>
      prev.rest > curr.rest ? prev : curr
    );

    // Encontrar el índice del elemento seleccionado en el array original
    const selectedIndex = this.data.findIndex(
      (item) =>
        item.content === selectedMail.content && item.type === selectedMail.type
    );

    if (selectedIndex !== -1) this.data[selectedIndex].status = "FULL";

    //TODO: Evaluar tambien cantidad de errores que ha generado
    logger.log(`Selected mail: ${selectedMail.content}`);

    return selectedMail;
  };

  private selectServer = async (
    attempts: number = 0
  ): Promise<ServerDataType> => {
    const maxAttempts = 5;
    const retryDelay = 1000; // 1 segundo

    // Filtrar los servidores que tienen el estado de "free"
    const freeServers = this.getFreeServers();

    if (freeServers.length > 0) {
      const selectedServer = this.markServerAsBusy(freeServers[0]);
      return selectedServer;
    }

    if (attempts < maxAttempts) {
      logger.log(
        `Attempt ${
          attempts + 1
        } failed. No free servers available. Retrying in ${
          retryDelay / 1000
        } second(s)...`
      );
      await this.delay(retryDelay);
      return this.selectServer(attempts + 1);
    }

    throw new Error("No free servers available after 5 attempts"); //TODO: CREAR ERROR CUSTOM
  };

  /**
   * Helper method to get free servers.
   * @returns {ServerDataType[]} - Array of free servers.
   */
  private getFreeServers(): ServerDataType[] {
    return this.servers.filter((server) => server.use === "FREE");
  }

  /**
   * Helper method to mark a server as busy.
   * @param {ServerDataType} server - The server to mark as busy.
   * @returns {ServerDataType} - The server marked as busy.
   */
  private markServerAsBusy(server: ServerDataType): ServerDataType {
    const serverIndex = this.servers.findIndex((s) => s === server);

    if (serverIndex !== -1) {
      this.servers[serverIndex].use = "BUSSY";
    }

    return server;
  }

  /**
   * Helper method to delay execution.
   * @param {number} ms - The number of milliseconds to delay.
   * @returns {Promise<void>} - A promise that resolves after the specified delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Private method to select numbers.
   */
  private selectNumber = (): void => {
    // Verificar el numero que tenga mas mensajes restantes
  };

  /**
   * * De aqui para  abajo tengo dudas realmente si son necesarios los siguientes metodos
   */

  private configMail = (): void => {};

  private configSMS = (): void => {};

  private verifyStatus = (): void => {};

  private verifyServers = (): void => {};

  private verifySMS = (): void => {};

  private verifyMail = (): void => {};
}
