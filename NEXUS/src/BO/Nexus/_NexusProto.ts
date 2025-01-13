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

  public sendMail = async (request: {
    email: string;
    subject: string;
    body: string;
  }): Promise<any> => {
    const PATH_PROTO = path.join(__dirname, "./mail.proto");

    const grpcClient = new GrpcClient({
      protoPath: PATH_PROTO,
      packageName: "mail",
      serviceName: "MailService",
      methodName: "SendMail",
      target: "0.0.0.0:50051",
    }).loadProto();

    return new Promise((resolve, reject) => {
      grpcClient.invokeMethod(request, (err, response) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Mail sent:", response);
          resolve(response);
        }
      });
    });
  };
}
