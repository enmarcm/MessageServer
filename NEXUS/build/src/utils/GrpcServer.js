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
const protoLoader = __importStar(require("@grpc/proto-loader"));
const CONFIG_PACKAGE_DEFINITION = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
/**
 * Clase que representa un servidor gRPC.
 */
class GrpcServer {
    /**
     * Crea una instancia de GrpcServer.
     * @param {GrpcServerOptions} options - Las opciones para el servidor gRPC.
     * @param {string} options.protoPath - La ruta al archivo .proto.
     * @param {Object} options.services - Los servicios que se añadirán al servidor.
     * @param {string} [options.bindAddress="127.0.0.1:50051"] - La dirección para enlazar el servidor.
     */
    constructor({ protoPath, services, bindAddress = "127.0.0.1:50051", }) {
        this.protoPath = protoPath;
        this.services = services;
        this.bindAddress = bindAddress;
        this.server = new grpc_js_1.Server();
    }
    /**
     * Carga el archivo .proto y añade los servicios al servidor gRPC.
     * @private
     * @throws Lanza un error si no se encuentra el nombre del paquete o el servicio en el archivo .proto.
     */
    loadProtoAndAddServices() {
        const packageDefinition = protoLoader.loadSync(this.protoPath, CONFIG_PACKAGE_DEFINITION);
        const protoDescriptor = (0, grpc_js_1.loadPackageDefinition)(packageDefinition);
        const packageName = Object.keys(protoDescriptor)[0];
        if (!packageName) {
            throw new Error(`No se encontró el nombre del paquete en el archivo proto.`);
        }
        Object.keys(this.services).forEach((serviceName) => {
            const service = protoDescriptor[packageName][serviceName];
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
    start() {
        this.loadProtoAndAddServices();
        this.server.bindAsync(this.bindAddress, grpc_js_1.ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                console.error(`El servidor no pudo enlazar: ${error.message}`);
                return;
            }
            console.log(`El servidor está escuchando en ${this.bindAddress}:${port}`);
            this.server.start();
        });
    }
}
exports.default = GrpcServer;
