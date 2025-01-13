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
  public sendMail = (content: EmailContent): void => {
    const { to, body, subject } = content;
    if (!to || !body || !subject) return; //TODO: Aqui hay que hacer un error

    if (!this.isValidEmail(to)) return; //TODO: Aqui hay que crear un error

    //! Validar que el correo que se vaya a enviar sea valido, para evitar perder mas tiempo
    //! Verificar servidor libre y seleccionar
    //! Verificar correo libre y seleccionar - Si no hay, se deja en la cola de nuevo
    //! Llamar al metodo de enviar correo mediante grpc
    // ! Devolver la informacion de si se envio o no  y enviar a logs
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
  private selectMail = (): void => {
    // Evaluar cuantos correos quedan y elegir el menor
    // Evaluar tambien cantidad de errores que ha generado
  };

  /**
   * Private method to select servers.
   */
  private selectServer = (): void => {
    // LLamar al servidor y preguntarle si actualmente esta en una solicitud
    // Verificar el que tenga mas ancho de banda
  };

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
