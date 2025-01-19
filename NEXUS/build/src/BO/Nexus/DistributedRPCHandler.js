"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const GrpcClient_1 = __importDefault(require("../../utils/GrpcClient"));
const methodsData_1 = require("./methodsData");
/**
 * DistributedRPCHandler class to manage gRPC clients for different servers.
 */
class DistributedRPCHandler {
    /**
     * Creates an instance of DistributedRPCHandler.
     * @param {ServerDataType[]} servers - The servers to initialize the gRPC clients.
     * @example
     * const rpcHandler = new DistributedRPCHandler([
     *   { name: 'Server1', host: 'localhost', port: 8080, status: 'ACTIVE', use: 'FREE', typeInfo: 'EMAIL' },
     *   { name: 'Server2', host: 'localhost', port: 9090, status: 'ACTIVE', use: 'FREE', typeInfo: 'SMS' }
     * ]);
     */
    constructor(servers) {
        /**
         * Initializes gRPC clients for each server.
         * @private
         */
        this.initGrpcClients = () => {
            const PATH_PROTO_MAIL = path_1.default.join(__dirname, "./mail.proto");
            const PATH_PROTO_DATA = path_1.default.join(__dirname, "./data.proto");
            const GRPC_CLIENTS = new Map();
            this.servers.forEach((server) => {
                const TARGET = `${server.host}:${server.port}`;
                const boClient = new GrpcClient_1.default({
                    protoPath: server.typeInfo === "EMAIL" ? PATH_PROTO_MAIL : "",
                    packageName: this.getPackageName(server.typeInfo),
                    serviceName: this.getServiceName(server.typeInfo),
                    methodName: this.getMethodName(server.typeInfo),
                    target: TARGET,
                }).loadProto();
                const dataClient = new GrpcClient_1.default((0, methodsData_1.GetServerStatsValues)({ protoPath: PATH_PROTO_DATA, target: TARGET })).loadProto();
                GRPC_CLIENTS.set(server, { bo: boClient, data: dataClient });
            });
            this.grpcClientsMap = GRPC_CLIENTS;
        };
        /**
         * Gets the package name based on the server type.
         * @private
         * @param {string} typeInfo - The type of the server (SMS or EMAIL).
         * @returns {string} The package name.
         */
        this.getPackageName = (typeInfo) => typeInfo === "SMS" ? "sms" : "mail";
        /**
         * Gets the service name based on the server type.
         * @private
         * @param {string} typeInfo - The type of the server (SMS or EMAIL).
         * @returns {string} The service name.
         */
        this.getServiceName = (typeInfo) => typeInfo === "SMS" ? "SMSService" : "MailService";
        /**
         * Gets the method name based on the server type.
         * @private
         * @param {string} typeInfo - The type of the server (SMS or EMAIL).
         * @returns {string} The method name.
         */
        this.getMethodName = (typeInfo) => typeInfo === "SMS" ? "SendSMS" : "SendMail";
        this.servers = servers;
        this.grpcClientsMap = new Map();
        this.initGrpcClients();
    }
}
exports.default = DistributedRPCHandler;
