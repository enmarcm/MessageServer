"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_js_1 = require("@grpc/grpc-js");
const protoLoader = __importStar(require("@grpc/proto-loader")); // Import protoLoader correctly
const CONFIG_PACKAGE_DEFINITION = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
/**
 * Represents a gRPC client for making requests to a gRPC server.
 *
 * @example
 * ```typescript
 * import GrpcClient from "./GrpcClient";
 *
 * const grpcClientInstance = new GrpcClient({
 *   protoPath: "./protos/mail.proto",
 *   packageName: "mail",
 *   serviceName: "MailService",
 *   methodName: "SendMail",
 * }).loadProto();
 *
 * const requestData = { email: "example@example.com", subject: "Hello", body: "World" };
 *
 * const callbackGRPC = (err: grpc.ServiceError | null, response: any) => {
 *   if (err) {
 *     console.error(`An error occurred: ${err.message}`);
 *     return;
 *   }
 *   console.log(`Status: ${response.status}`);
 * };
 *
 * grpcClientInstance.invokeMethod(requestData, callbackGRPC);
 * ```
 */
class GrpcClient {
    /**
     * Creates an instance of GrpcClient.
     * @param {GrpcClientConfig} config - The configuration object for the gRPC client.
     * @param {string} config.protoPath - The path to the .proto file.
     * @param {string} [config.target="localhost:50051"] - The server target.
     * @param {string} config.packageName - The name of the package in the proto definition.
     * @param {string} config.serviceName - The name of the service in the proto definition.
     * @param {string} config.methodName - The name of the method to invoke on the gRPC service.
     */
    constructor({ protoPath, target = "localhost:50051", packageName, serviceName, methodName, }) {
        this.protoPath = protoPath;
        this.target = target;
        this.packageName = packageName;
        this.serviceName = serviceName;
        this.methodName = methodName;
        this.client = null;
        this.packageDefinition = null;
        this.grpcObject = null;
    }
    /**
     * Loads the proto file and initializes the gRPC client.
     * @returns {GrpcClient} The instance of this GrpcClient.
     */
    loadProto() {
        try {
            const packageDefinition = protoLoader.loadSync(this.protoPath, CONFIG_PACKAGE_DEFINITION);
            this.packageDefinition = packageDefinition;
            this.grpcObject = (0, grpc_js_1.loadPackageDefinition)(packageDefinition);
            // Ensure the package exists in the loaded object
            if (!this.grpcObject[this.packageName]) {
                throw new Error(`Package ${this.packageName} not found in proto file`);
            }
            // Ensure the service exists in the package
            if (!this.grpcObject[this.packageName][this.serviceName]) {
                throw new Error(`Service ${this.serviceName} not found in package ${this.packageName}`);
            }
            // Directly create the client for the specified service
            const service = this.grpcObject[this.packageName][this.serviceName];
            this.client = new service(this.target, grpc_js_1.credentials.createInsecure());
            return this;
        }
        catch (error) {
            console.error(`An error occurred while loading proto file: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
    /**
     * Invokes a method on the gRPC service.
     * @param {Object} requestData - The request data to send.
     * @param {function} callback - The callback function to handle the response.
     */
    invokeMethod(requestData, callback) {
        try {
            if (!this.client) {
                throw new Error("Client not initialized");
            }
            const method = this.client[this.methodName];
            if (typeof method !== "function") {
                throw new Error(`Method ${this.methodName} not found in client`);
            }
            method.call(this.client, requestData, callback);
        }
        catch (error) {
            console.error(`An error occurred while invoking method: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
exports.default = GrpcClient;
