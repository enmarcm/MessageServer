import path from "path";
import GrpcClient from "../../utils/GrpcClient";
import { NexusDataType, NexusQueType, ServerDataType } from "./NexusTypes";

export default class Nexus {
  public que: NexusQueType[];
  public data: NexusDataType[];
  public servers: ServerDataType[];

  constructor() {
    this.que = [];
    this.data = [];
    this.servers = [];
  }

  public sendMail = (request: {
    email: string;
    subject: string;
    body: string;
  }): void => {
    const PATH_PROTO = path.join(__dirname, "./mail.proto");

    const grpcClient = new GrpcClient({
      protoPath: PATH_PROTO,
      packageName: "mail",
      serviceName: "MailService",
      methodName: "SendMail",
      target: "0.0.0.0:50052",
    }).loadProto();

    grpcClient.invokeMethod(request, (err, response) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Mail sent:", response);
      }
    });
  };

  public sendSMS = (request: { number: string; message: string }): void => {
    const grpcClient = new GrpcClient({
      protoPath: "./mail.proto",
      packageName: "mail",
      serviceName: "SMSService",
      methodName: "SendSMS",
    }).loadProto();

    grpcClient.invokeMethod(request, (err, response) => {
      if (err) {
        console.error(err);
      } else {
        console.log("SMS sent:", response);
      }
    });
  };

  public sendLogs = (request: { log: string }): void => {
    const grpcClient = new GrpcClient({
      protoPath: "./protos/mail.proto",
      packageName: "mail",
      serviceName: "LogService",
      methodName: "SendLogs",
    }).loadProto();

    grpcClient.invokeMethod(request, (err, response) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Log sent:", response);
      }
    });
  };
}
