import { NexusDataType, ServerDataType } from "./NexusTypes";
import { logger } from "../../data/instances";

/**
 * SelectionHandler class to handle selection of mails and servers.
 */
export default class SelectionHandler {
  private data: NexusDataType[];
  private servers: ServerDataType[];

  /**
   * Creates an instance of SelectionHandler.
   * @param {NexusDataType[]} data - The data to initialize the SelectionHandler instance.
   * @param {ServerDataType[]} servers - The servers to initialize the SelectionHandler instance.
   * @example
   * const selectionHandler = new SelectionHandler(
   *   [{ type: 'EMAIL', content: 'example@mail.com', status: 'INACTIVE', rest: 0, credentials: {} }],
   *   [{ name: 'Server1', host: 'localhost', port: 8080, status: 'ACTIVE', use: 'FREE', typeInfo: 'EMAIL' }]
   * );
   */
  constructor(data: NexusDataType[], servers: ServerDataType[]) {
    this.data = data;
    this.servers = servers;
  }

  /**
   * Selects an active mail with the most remaining usage.
   * @param {number} [attempts=0] - The number of attempts made to select a mail.
   * @returns {Promise<NexusDataType>} The selected mail.
   * @throws Will throw an error if no active mails are available after 5 attempts.
   */
  public async selectMail(attempts: number = 0): Promise<NexusDataType> {
    const maxAttempts = 5;
    const retryDelay = 1000; // 1 second

    const activeMails = this.data.filter(
      (item) => item.status === "ACTIVE" && item.rest > 0
    );

    if (activeMails.length === 0) {
      if (attempts < maxAttempts) {
        logger.log(
          `Attempt ${
            attempts + 1
          } failed. No active mails available. Retrying in ${
            retryDelay / 1000
          } second(s)...`
        );
        await this.delay(retryDelay);
        return this.selectMail(attempts + 1);
      } else {
        logger.error("No active mails available after 5 attempts");
        throw new Error("No active mails available after 5 attempts");
      }
    }

    const selectedMail = activeMails.reduce((prev, curr) =>
      prev.rest > curr.rest ? prev : curr
    );

    const selectedIndex = this.data.findIndex(
      (item) =>
        item.content === selectedMail.content && item.type === selectedMail.type
    );

    if (selectedIndex !== -1) this.data[selectedIndex].status = "FULL";

    logger.log(`Selected mail: ${selectedMail.content}`);

    return selectedMail;
  }

  /**
   * Gets the server with the most available resources.
   * @param {Map<any, { bo: any; data: any }>} grpcClientsMap - The map of gRPC clients.
   * @param {string} serviceType - The type of service (EMAIL or SMS).
   * @returns {Promise<ServerDataType | null>} The server with the most resources or null if an error occurs.
   */
  public async getServerWithMostResources(
    grpcClientsMap: Map<any, { bo: any; data: any }>,
    serviceType: 'EMAIL' | 'SMS'
  ): Promise<ServerDataType | null> {
    try {
      const serverResources = await Promise.all(
        Array.from(grpcClientsMap.entries()).map(async ([server, clients]) => {
          if (server.typeInfo !== serviceType) {
            return { server, availableResources: 0 };
          }
          try {
            const response = await new Promise<any>((resolve, reject) => {
              clients.data.invokeMethod({}, (err: Error | null, res: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(res);
                }
              });
            });

            const freeMemory = parseFloat(response.free_memory);
            const totalMemory = parseFloat(response.total_memory);
            const diskUsagePercentage = parseFloat(
              response.disk_usage.replace("%", "")
            );
            const diskUsage = (diskUsagePercentage / 100) * totalMemory;

            const availableResources = freeMemory + (totalMemory - diskUsage);

            const dataToSend = { server, availableResources };

            return dataToSend;
          } catch (error) {
            logger.error(
              `Error getting resources for server ${server.name}: ${error}`
            );
            return { server, availableResources: 0 };
          }
        })
      );

      const serverWithMostResources = serverResources.reduce(
        (max, current) =>
          current.availableResources > max.availableResources ? current : max,
        { server: null, availableResources: 0 }
      ).server;

      return serverWithMostResources;
    } catch (error) {
      logger.error(`Error in getServerWithMostResources: ${error}`);
      return null;
    }
  }

  /**
   * Selects a free server with the most resources.
   * @param {Map<any, { bo: any; data: any }>} grpcClientsMap - The map of gRPC clients.
   * @param {string} serviceType - The type of service (EMAIL or SMS).
   * @param {number} [attempts=0] - The number of attempts made to select a server.
   * @returns {Promise<ServerDataType>} The selected server.
   * @throws Will throw an error if no free servers are available after 5 attempts.
   */
  public async selectServer(
    grpcClientsMap: Map<any, { bo: any; data: any }>,
    serviceType: 'EMAIL' | 'SMS',
    attempts: number = 0
  ): Promise<ServerDataType> {
    const maxAttempts = 5;
    const retryDelay = 1000; 
  
    const freeServers = this.getFreeServers(serviceType);

    if (freeServers.length > 0) {
      const serverWithMostResources = await this.getServerWithMostResources(
        grpcClientsMap,
        serviceType
      );
      if (serverWithMostResources) {
        const selectedServer = this.markServerAsBusy(serverWithMostResources, serviceType);
        return selectedServer;
      }
    }
  
    if (attempts < maxAttempts) {
      logger.log(
        `Attempt ${
          attempts + 1
        } failed. No free servers available for ${serviceType}. Retrying in ${
          retryDelay / 1000
        } second(s)...`
      );
      await this.delay(retryDelay);
      return this.selectServer(grpcClientsMap, serviceType, attempts + 1);
    }
  
    throw new Error(`No free servers available for ${serviceType} after 5 attempts`);
  }

  /**
   * Gets the list of free servers.
   * @private
   * @param {string} serviceType - The type of service (EMAIL or SMS).
   * @returns {ServerDataType[]} The list of free servers.
   */
  private getFreeServers(serviceType: 'EMAIL' | 'SMS'): ServerDataType[] {
    return this.servers.filter((server) => server.use === 'FREE' && server.typeInfo === serviceType);
  }

  /**
   * Marks a server as busy.
   * @private
   * @param {ServerDataType} server - The server to mark as busy.
   * @param {string} serviceType - The type of service (EMAIL or SMS).
   * @returns {ServerDataType} The server marked as busy.
   */
  private markServerAsBusy(server: ServerDataType, serviceType: 'EMAIL' | 'SMS'): ServerDataType {
    const serverIndex = this.servers.findIndex((s) => s === server && s.typeInfo === serviceType);

    if (serverIndex !== -1) this.servers[serverIndex].use = "BUSSY";

    return server;
  }

  /**
   * Delays execution for a specified amount of time.
   * @private
   * @param {number} ms - The delay time in milliseconds.
   * @returns {Promise<void>} A promise that resolves after the delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}