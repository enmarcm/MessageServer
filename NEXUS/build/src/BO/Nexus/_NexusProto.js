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
const path_1 = __importDefault(require("path"));
const GrpcClient_1 = __importDefault(require("../../utils/GrpcClient"));
const instances_1 = require("../../data/instances");
const methodsData_1 = require("./methodsData");
class Nexus {
    constructor() {
        this.sendMail = (request) => __awaiter(this, void 0, void 0, function* () {
            const PATH_PROTO = path_1.default.join(__dirname, "./mail.proto");
            const TARGET = "0.0.0.0:50051";
            const grpcClient = new GrpcClient_1.default((0, methodsData_1.SendMailValues)({ protoPath: PATH_PROTO, target: TARGET })).loadProto();
            return new Promise((resolve, reject) => {
                grpcClient.invokeMethod(request, (err, response) => {
                    if (err) {
                        instances_1.logger.error(err);
                        reject(err);
                    }
                    else {
                        instances_1.logger.log(`Mail sent:, ${JSON.stringify(response)}`);
                        resolve(response);
                    }
                });
            });
        });
        this.getServerStats = () => __awaiter(this, void 0, void 0, function* () {
            const PATH_PROTO = path_1.default.join(__dirname, "./data.proto");
            const TARGET = "0.0.0.0:50052";
            const grpcClient = new GrpcClient_1.default({
                protoPath: PATH_PROTO,
                target: TARGET,
                packageName: "data",
                serviceName: "DataService",
                methodName: "GetServerStats"
            }).loadProto();
            return new Promise((resolve, reject) => {
                grpcClient.invokeMethod({}, (err, response) => {
                    if (err) {
                        instances_1.logger.error(err);
                        reject(err);
                    }
                    else {
                        instances_1.logger.log(`Server stats received: ${JSON.stringify(response)}`);
                        resolve(response);
                    }
                });
            });
        });
        this.que = [];
        this.data = [];
        this.servers = [];
    }
}
exports.default = Nexus;
