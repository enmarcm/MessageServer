import {
  ConstructorNexusData,
  NexusDataType,
  NexusQueType,
  ServerDataType,
} from "./NexusTypes";

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
   * Constructor for the Nexus class.
   * @param {ConstructorNexusData} param0 - Object containing data and servers.
   */
  constructor({ data, servers }: ConstructorNexusData) {
    this.que = [];
    this.data = data;
    this.servers = servers;
  }

  /**
   * Method to send emails.
   */
  public sendMail = (): void => {};

  /**
   * Method to send SMS.
   */
  public sendSMS = (): void => {};

  /**
   * Method to send logs.
   */
  public sendLogs = (): void => {};

  /**
   * Private method to select emails.
   */
  private selectMail = (): void => {};

  /**
   * Private method to select servers.
   */
  private selectServer = (): void => {};

  /**
   * Private method to select numbers.
   */
  private selectNumber = (): void => {};

  /**
   * Private method to configure emails.
   */
  private configMail = (): void => {};

  /**
   * Private method to configure SMS.
   */
  private configSMS = (): void => {};

  /**
   * Private method to verify status.
   */
  private verifyStatus = (): void => {};

  /**
   * Private method to verify servers.
   */
  private verifyServers = (): void => {};

  /**
   * Private method to verify SMS.
   */
  private verifySMS = (): void => {};

  /**
   * Private method to verify emails.
   */
  private verifyMail = (): void => {};
}
