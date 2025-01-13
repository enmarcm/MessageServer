import path from "path";
import GrpcClient from "../../utils/GrpcClient";
import { NexusDataType, NexusQueType, ServerDataType } from "./NexusTypes";
import { logger } from "../../data/instances";
import { SendMailValues } from "./methodsData";

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
    const TARGET = "0.0.0.0:50051";

    const grpcClient = new GrpcClient(
      SendMailValues({ protoPath: PATH_PROTO, target: TARGET })
    ).loadProto();

    return new Promise((resolve, reject) => {
      grpcClient.invokeMethod(request, (err, response) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          logger.log(`Mail sent:, ${JSON.stringify(response)}`);
          resolve(response);
        }
      });
    });
  };
}
