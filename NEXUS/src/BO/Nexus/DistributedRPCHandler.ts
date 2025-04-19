import path from "path";
import GrpcClient from "../../utils/GrpcClient";
import { ServerDataType } from "./NexusTypes";
import { GetServerStatsValues } from "./methodsData";

/**
 * DistributedRPCHandler class to manage gRPC clients for different servers.
 */
export default class DistributedRPCHandler {
  private servers: ServerDataType[];
  public grpcClientsMap: Map<any, { bo: GrpcClient; data: GrpcClient }>;

  /**
   * Creates an instance of DistributedRPCHandler.
   * @param {ServerDataType[]} servers - The servers to initialize the gRPC clients.
   * @example
   * const rpcHandler = new DistributedRPCHandler([
   *   { name: 'Server1', host: 'localhost', port: 8080, status: 'ACTIVE', use: 'FREE', typeInfo: 'EMAIL' },
   *   { name: 'Server2', host: 'localhost', port: 9090, status: 'ACTIVE', use: 'FREE', typeInfo: 'SMS' }
   * ]);
   */
  constructor(servers: ServerDataType[]) {
    this.servers = servers;
    this.grpcClientsMap = new Map();
    this.initGrpcClients();
  }

  /**
   * Initializes gRPC clients for each server.
   * @private
   */
  private initGrpcClients = (): void => {
    const PATH_PROTO_MAIL = path.join(__dirname, "./protos/mail.proto");
    const PATH_PROTO_DATA = path.join(__dirname, "./protos/data.proto");
    const PATH_PROTO_SMS = path.join(__dirname, "./protos/sms.proto");
  
    const GRPC_CLIENTS = new Map();
  
    this.servers.forEach((server: ServerDataType) => {
      const TARGET = `${server.host}:${server.port}`;
  
      const boClient = new GrpcClient({
        protoPath: server.typeInfo === "EMAIL" ? PATH_PROTO_MAIL : PATH_PROTO_SMS,
        packageName: this.getPackageName(server.typeInfo),
        serviceName: this.getServiceName(server.typeInfo),
        target: TARGET, 
      }).loadProto();
  
      const dataClient = new GrpcClient(
        GetServerStatsValues({ protoPath: PATH_PROTO_DATA, target: TARGET })
      ).loadProto();
  
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
  private getPackageName = (typeInfo: string): string =>
    typeInfo === "SMS" ? "sms" : "mail";

  /**
   * Gets the service name based on the server type.
   * @private
   * @param {string} typeInfo - The type of the server (SMS or EMAIL).
   * @returns {string} The service name.
   */
  private getServiceName = (typeInfo: string): string =>
    typeInfo === "SMS" ? "SMSService" : "MailService";

}