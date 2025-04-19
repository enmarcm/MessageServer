import * as grpc from "@grpc/grpc-js";
import { credentials, ServiceClientConstructor, loadPackageDefinition } from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

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
}

class GrpcClient {
  private protoPath: string;
  private target: string;
  private packageName: string;
  private serviceName: string;
  private client: grpc.Client | null;
  public packageDefinition: protoLoader.PackageDefinition | null;
  private grpcObject: any;

  constructor({
    protoPath,
    target = "localhost:50051",
    packageName,
    serviceName,
  }: GrpcClientConfig) {
    this.protoPath = protoPath;
    this.target = target;
    this.packageName = packageName;
    this.serviceName = serviceName;
    this.client = null;
    this.packageDefinition = null;
    this.grpcObject = null;
  }

  loadProto(): GrpcClient {
    try {
      const packageDefinition = protoLoader.loadSync(
        this.protoPath,
        CONFIG_PACKAGE_DEFINITION
      );
      this.packageDefinition = packageDefinition;
      this.grpcObject = loadPackageDefinition(packageDefinition);

      if (!this.grpcObject[this.packageName]) {
        throw new Error(`Package ${this.packageName} not found in proto file`);
      }

      if (!this.grpcObject[this.packageName][this.serviceName]) {
        throw new Error(`Service ${this.serviceName} not found in package ${this.packageName}`);
      }

      const service = this.grpcObject[this.packageName][this.serviceName] as ServiceClientConstructor;
      this.client = new service(this.target, credentials.createInsecure());

      return this;
    } catch (error) {
      console.error(`An error occurred while loading proto file: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  invokeMethod(
    methodName: string,
    requestData: any,
    callback: (err: grpc.ServiceError | null, response: any) => void
  ): void {

    try {
      if (!this.client) {
        throw new Error("Client not initialized");
      }

      const method = (this.client as any)[methodName];

      if (typeof method !== "function") {
        throw new Error(`Method ${methodName} not found in client`);
      }

      method.call(this.client, requestData, callback);
    } catch (error) {
      console.error(`An error occurred while invoking method: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}

export default GrpcClient;