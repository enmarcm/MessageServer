"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const instances_1 = require("../../data/instances");
/**
 * SelectionHandler class to handle selection of mails and servers.
 */
class SelectionHandler {
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
    constructor(data, servers) {
        this.data = data;
        this.servers = servers;
    }
    /**
     * Selects an active mail with the most remaining usage.
     * @param {number} [attempts=0] - The number of attempts made to select a mail.
     * @returns {Promise<NexusDataType>} The selected mail.
     * @throws Will throw an error if no active mails are available after 5 attempts.
     */
    selectMail() {
        return __awaiter(this, arguments, void 0, function* (attempts = 0) {
            const maxAttempts = 5;
            const retryDelay = 1000; // 1 second
            const activeMails = this.data.filter((item) => item.status === "ACTIVE" && item.rest > 0);
            if (activeMails.length === 0) {
                if (attempts < maxAttempts) {
                    instances_1.logger.log(`Attempt ${attempts + 1} failed. No active mails available. Retrying in ${retryDelay / 1000} second(s)...`);
                    yield this.delay(retryDelay);
                    return this.selectMail(attempts + 1);
                }
                else {
                    instances_1.logger.error("No active mails available after 5 attempts");
                    throw new Error("No active mails available after 5 attempts");
                }
            }
            const selectedMail = activeMails.reduce((prev, curr) => prev.rest > curr.rest ? prev : curr);
            const selectedIndex = this.data.findIndex((item) => item.content === selectedMail.content && item.type === selectedMail.type);
            if (selectedIndex !== -1)
                this.data[selectedIndex].status = "FULL";
            instances_1.logger.log(`Selected mail: ${selectedMail.content}`);
            return selectedMail;
        });
    }
    /**
     * Gets the server with the most available resources.
     * @param {Map<any, { bo: any; data: any }>} grpcClientsMap - The map of gRPC clients.
     * @returns {Promise<ServerDataType | null>} The server with the most resources or null if an error occurs.
     */
    getServerWithMostResources(grpcClientsMap) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serverResources = yield Promise.all(Array.from(grpcClientsMap.entries()).map((_a) => __awaiter(this, [_a], void 0, function* ([server, clients]) {
                    try {
                        const response = yield new Promise((resolve, reject) => {
                            clients.data.invokeMethod({}, (err, res) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(res);
                                }
                            });
                        });
                        const freeMemory = parseFloat(response.free_memory);
                        const totalMemory = parseFloat(response.total_memory);
                        const diskUsagePercentage = parseFloat(response.disk_usage.replace("%", ""));
                        const diskUsage = (diskUsagePercentage / 100) * totalMemory;
                        const availableResources = freeMemory + (totalMemory - diskUsage);
                        const dataToSend = { server, availableResources };
                        return dataToSend;
                    }
                    catch (error) {
                        instances_1.logger.error(`Error getting resources for server ${server.name}: ${error}`);
                        return { server, availableResources: 0 };
                    }
                })));
                const serverWithMostResources = serverResources.reduce((max, current) => current.availableResources > max.availableResources ? current : max, { server: null, availableResources: 0 }).server;
                return serverWithMostResources;
            }
            catch (error) {
                instances_1.logger.error(`Error in getServerWithMostResources: ${error}`);
                return null;
            }
        });
    }
    /**
     * Selects a free server with the most resources.
     * @param {Map<any, { bo: any; data: any }>} grpcClientsMap - The map of gRPC clients.
     * @param {number} [attempts=0] - The number of attempts made to select a server.
     * @returns {Promise<ServerDataType>} The selected server.
     * @throws Will throw an error if no free servers are available after 5 attempts.
     */
    selectServer(grpcClientsMap_1) {
        return __awaiter(this, arguments, void 0, function* (grpcClientsMap, attempts = 0) {
            const maxAttempts = 5;
            const retryDelay = 1000; // 1 second
            const freeServers = this.getFreeServers();
            if (freeServers.length > 0) {
                const serverWithMostResources = yield this.getServerWithMostResources(grpcClientsMap);
                if (serverWithMostResources) {
                    const selectedServer = this.markServerAsBusy(serverWithMostResources);
                    return selectedServer;
                }
            }
            if (attempts < maxAttempts) {
                instances_1.logger.log(`Attempt ${attempts + 1} failed. No free servers available. Retrying in ${retryDelay / 1000} second(s)...`);
                yield this.delay(retryDelay);
                return this.selectServer(grpcClientsMap, attempts + 1);
            }
            throw new Error("No free servers available after 5 attempts");
        });
    }
    /**
     * Gets the list of free servers.
     * @private
     * @returns {ServerDataType[]} The list of free servers.
     */
    getFreeServers() {
        return this.servers.filter((server) => server.use === "FREE");
    }
    /**
     * Marks a server as busy.
     * @private
     * @param {ServerDataType} server - The server to mark as busy.
     * @returns {ServerDataType} The server marked as busy.
     */
    markServerAsBusy(server) {
        const serverIndex = this.servers.findIndex((s) => s === server);
        if (serverIndex !== -1)
            this.servers[serverIndex].use = "BUSSY";
        return server;
    }
    /**
     * Delays execution for a specified amount of time.
     * @private
     * @param {number} ms - The delay time in milliseconds.
     * @returns {Promise<void>} A promise that resolves after the delay.
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.default = SelectionHandler;
