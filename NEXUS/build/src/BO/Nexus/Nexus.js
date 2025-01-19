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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const instances_1 = require("../../data/instances");
const SelectionHandler_1 = __importDefault(require("./SelectionHandler"));
const DistributedRPCHandler_1 = __importDefault(require("./DistributedRPCHandler"));
/**
 * Nexus class to handle email and SMS sending operations.
 */
class Nexus {
    /**
     * Creates an instance of Nexus.
     * @param {ConstructorNexusData} param0 - The data and servers to initialize the Nexus instance.
     * @example
     * const nexus = new Nexus({
     *   data: [{ type: 'EMAIL', content: 'example@mail.com', status: 'INACTIVE', rest: 0, credentials: {} }],
     *   servers: [{ name: 'Server1', host: 'localhost', port: 8080, status: 'ACTIVE', use: 'FREE', typeInfo: 'EMAIL' }]
     * });
     */
    constructor({ data, servers }) {
        /**
         * Adds an item to the queue and emits a newItem event.
         * @param {NexusQueType} item - The item to add to the queue.
         */
        this.addQue = (item) => {
            this.que.push(item);
            this.eventEmitter.emit("newItem");
        };
        /**
         * Processes the queue by sending the first item.
         * @private
         */
        this.processQueue = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.que.length > 0) {
                    const item = this.que.shift();
                    if (item) {
                        yield this.sendItem(item);
                    }
                }
            }
            catch (error) {
            }
        });
        /**
         * Sends an email.
         * @param {EmailContent} content - The email content.
         */
        this.sendMail = (content) => __awaiter(this, void 0, void 0, function* () {
            const { to, body, subject } = content;
            if (!to || !body || !subject)
                return;
            if (!this.isValidEmail(to))
                return;
            let serverToUse = null;
            let mailToUse = null;
            try {
                serverToUse = yield this.selectionHandler.selectServer(this.grpcClientsMap);
                mailToUse = yield this.selectionHandler.selectMail();
                const contentMapped = { from: mailToUse.content, to, subject, body };
                yield new Promise((resolve, reject) => {
                    var _a;
                    (_a = this.grpcClientsMap
                        .get(serverToUse)) === null || _a === void 0 ? void 0 : _a.bo.invokeMethod(contentMapped, (err, response) => {
                        if (err) {
                            instances_1.logger.error(err);
                            reject(err);
                        }
                        else {
                            instances_1.logger.log(`Mail sent: ${JSON.stringify(response)}`);
                            resolve();
                        }
                    });
                });
                instances_1.logger.log(`Sending email to ${to} with subject ${subject} and Body`);
            }
            catch (error) {
                instances_1.logger.error(`Error sending email: ${error}`);
                this.addQue({ type: "EMAIL", content });
            }
            finally {
                if (serverToUse) {
                    this.markServerAsFree(serverToUse);
                }
                if (mailToUse) {
                    this.markMailAsActive(mailToUse);
                }
            }
        });
        /**
         * Sends an SMS.
         * @param {SMSContent} content - The SMS content.
         */
        this.sendSMS = (_content) => {
            // Implementar lógica para enviar SMS
        };
        /**
         * Sends logs.
         */
        this.sendLogs = () => {
            // Implementar lógica para enviar logs
        };
        /**
         * Selects a number.
         * @private
         */
        //@ts-ignore
        this.selectNumber = () => {
            // Implementar lógica para seleccionar números
        };
        this.que = [];
        this.data = data;
        this.servers = servers;
        this.eventEmitter = new stream_1.EventEmitter();
        this.selectionHandler = new SelectionHandler_1.default(this.data, this.servers);
        this.rpcHandler = new DistributedRPCHandler_1.default(this.servers);
        this.grpcClientsMap = this.rpcHandler.grpcClientsMap;
        this.eventEmitter.on("newItem", this.processQueue);
    }
    /**
     * Sends an item based on its type (EMAIL or SMS).
     * @private
     * @param {NexusQueType} item - The item to send.
     */
    sendItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendMethod = item.type === "EMAIL" ? "sendMail" : "sendSMS";
            const { content } = item;
            if (!(content === null || content === void 0 ? void 0 : content.to) || !(content === null || content === void 0 ? void 0 : content.body))
                return;
            yield this[sendMethod](content);
        });
    }
    /**
     * Marks a server as free.
     * @private
     * @param {ServerDataType} server - The server to mark as free.
     * @returns {ServerDataType} The server marked as free.
     */
    markServerAsFree(server) {
        const serverIndex = this.servers.findIndex((s) => s === server);
        if (serverIndex !== -1)
            this.servers[serverIndex].use = "FREE";
        return server;
    }
    /**
     * Marks an email as active.
     * @private
     * @param {NexusDataType} mailToUse - The email to mark as active.
     */
    markMailAsActive(mailToUse) {
        const mailIndex = this.data.findIndex((m) => m === mailToUse);
        if (mailIndex !== -1)
            this.data[mailIndex].status = "ACTIVE";
    }
    /**
     * Validates an email address.
     * @private
     * @param {string} email - The email address to validate.
     * @returns {boolean} True if the email is valid, false otherwise.
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.default = Nexus;
