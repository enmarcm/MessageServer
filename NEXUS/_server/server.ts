import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import path from "path";
import GrpcServer from "../src/utils/GrpcServer";
const PROTO_PATH = path.join(__dirname, "./mail.proto");

interface MailRequest {
  email: string;
  subject: string;
  body: string;
}

interface MailResponse {
  status: string;
}

const services = {
  MailService: {
    SendMail: (call: ServerUnaryCall<MailRequest, MailResponse>, callback: sendUnaryData<MailResponse>) => {
      const { email, subject, body } = call.request;
      console.log(`Received email request: ${email}, ${subject}, ${body}`);
      // Implementa la lógica para enviar el correo aquí
      callback(null, { status: "Email received" });
    },
  },
};

const server = new GrpcServer({
  protoPath: PROTO_PATH,
  services: services,
  bindAddress: "0.0.0.0:50052",
});

server.start();
