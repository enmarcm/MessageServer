"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const GrpcServer_1 = __importDefault(require("../src/utils/GrpcServer"));
const PROTO_PATH = path_1.default.join(__dirname, "./mail.proto");
const services = {
    MailService: {
        SendMail: (call, callback) => {
            const { email, subject, body } = call.request;
            console.log(`Received email request: ${email}, ${subject}, ${body}`);
            // Implementa la lógica para enviar el correo aquí
            callback(null, { status: "Email received" });
        },
    },
};
const server = new GrpcServer_1.default({
    protoPath: PROTO_PATH,
    services: services,
    bindAddress: "0.0.0.0:50052",
});
server.start();
