import * as grpc from "@grpc/grpc-js";
import { credentials, ServiceClientConstructor, loadPackageDefinition } from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader"; // Import protoLoader correctly

const CONFIG_PACKAGE_DEFINITION: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

interface GrpcClientConfig {
  protoPath: string;
  target?: string;
  packageName: string;
  serviceName: string;
  methodName: string;
}

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
  private protoPath: string;
  private target: string;
  private packageName: string;
  private serviceName: string;
  private methodName: string;
  private client: grpc.Client | null;
  public packageDefinition: protoLoader.PackageDefinition | null;
  private grpcObject: any;

  /**
   * Creates an instance of GrpcClient.
   * @param {GrpcClientConfig} config - The configuration object for the gRPC client.
   * @param {string} config.protoPath - The path to the .proto file.
   * @param {string} [config.target="localhost:50051"] - The server target.
   * @param {string} config.packageName - The name of the package in the proto definition.
   * @param {string} config.serviceName - The name of the service in the proto definition.
   * @param {string} config.methodName - The name of the method to invoke on the gRPC service.
   */
  constructor({
    protoPath,
    target = "localhost:50051",
    packageName,
    serviceName,
    methodName,
  }: GrpcClientConfig) {
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
  loadProto(): GrpcClient {
    try {
      const packageDefinition = protoLoader.loadSync(
        this.protoPath,
        CONFIG_PACKAGE_DEFINITION
      );
      this.packageDefinition = packageDefinition;
      this.grpcObject = loadPackageDefinition(packageDefinition);

      // Ensure the package exists in the loaded object
      if (!this.grpcObject[this.packageName]) {
        throw new Error(`Package ${this.packageName} not found in proto file`);
      }

      // Ensure the service exists in the package
      if (!this.grpcObject[this.packageName][this.serviceName]) {
        throw new Error(`Service ${this.serviceName} not found in package ${this.packageName}`);
      }

      // Directly create the client for the specified service
      const service = this.grpcObject[this.packageName][this.serviceName] as ServiceClientConstructor;
      this.client = new service(this.target, credentials.createInsecure());

      return this;
    } catch (error) {
      console.error(`An error occurred while loading proto file: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Invokes a method on the gRPC service.
   * @param {Object} requestData - The request data to send.
   * @param {function} callback - The callback function to handle the response.
   */
  invokeMethod(requestData: any, callback: (err: grpc.ServiceError | null, response: any) => void): void {
    try {
      if (!this.client) {
        throw new Error("Client not initialized");
      }

      const method = (this.client as any)[this.methodName];
      if (typeof method !== "function") {
        throw new Error(`Method ${this.methodName} not found in client`);
      }

      method.call(this.client, requestData, callback);
    } catch (error) {
      console.error(`An error occurred while invoking method: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}

export default GrpcClient;