import  {
  Server,
  ServerCredentials,
  UntypedServiceImplementation,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { PackageDefinition } from "@grpc/proto-loader";

const CONFIG_PACKAGE_DEFINITION: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

interface GrpcServerOptions {
  protoPath: string;
  services: { [key: string]: UntypedServiceImplementation };
  bindAddress?: string;
}

/**
 * Clase que representa un servidor gRPC.
 */
class GrpcServer {
  private protoPath: string;
  private services: { [key: string]: UntypedServiceImplementation };
  private bindAddress: string;
  private server: Server;

  /**
   * Crea una instancia de GrpcServer.
   * @param {GrpcServerOptions} options - Las opciones para el servidor gRPC.
   * @param {string} options.protoPath - La ruta al archivo .proto.
   * @param {Object} options.services - Los servicios que se añadirán al servidor.
   * @param {string} [options.bindAddress="127.0.0.1:50051"] - La dirección para enlazar el servidor.
   */
  constructor({
    protoPath,
    services,
    bindAddress = "127.0.0.1:50051",
  }: GrpcServerOptions) {
    this.protoPath = protoPath;
    this.services = services;
    this.bindAddress = bindAddress;
    this.server = new Server();
  }

  /**
   * Carga el archivo .proto y añade los servicios al servidor gRPC.
   * @private
   * @throws Lanza un error si no se encuentra el nombre del paquete o el servicio en el archivo .proto.
   */
  private loadProtoAndAddServices(): void {
    const packageDefinition: PackageDefinition = protoLoader.loadSync(
      this.protoPath,
      CONFIG_PACKAGE_DEFINITION
    );
    const protoDescriptor = loadPackageDefinition(packageDefinition);
    const packageName = Object.keys(protoDescriptor)[0];
    if (!packageName) {
      throw new Error(`No se encontró el nombre del paquete en el archivo proto.`);
    }

    Object.keys(this.services).forEach((serviceName) => {
      const service = (protoDescriptor as any)[packageName][serviceName];
      if (!service) {
        throw new Error(`Servicio ${serviceName} no encontrado en el paquete ${packageName}.`);
      }

      this.server.addService(service.service, this.services[serviceName]); // Asegúrate de pasar la definición e implementación del servicio correctamente
    });
  }

  /**
   * Inicia el servidor gRPC.
   * @public
   */
  public start(): void {
    this.loadProtoAndAddServices();
    this.server.bindAsync(
      this.bindAddress,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error(`El servidor no pudo enlazar: ${error.message}`);
          return;
        }
        console.log(`El servidor está escuchando en ${this.bindAddress}:${port}`);
        this.server.start();
      }
    );
  }
}

export default GrpcServer;
