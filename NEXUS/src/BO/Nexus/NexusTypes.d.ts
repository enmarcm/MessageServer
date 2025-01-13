export type ElementStatus = "ACTIVE" | "FULL";
export type DataType = "SMS" | "EMAIL";
export type ServerStatus = "ONLINE" | "OFFLINE";
export type NexusQueType = { type: DataType; content: Content };

export type ServerDataType = {
  name: String;
  host: String;
  port: Number;
  status: ServerStatus;
  typeInfo: "SMS" | "EMAIL";
};
export type NexusDataType = {
  type: DataType;
  content: String;
  status: ElementStatus;
  rest: Number;
  credentials: Object;
};
export interface ConstructorNexusData {
  data: Array<NexusDataType>;
  servers: Array<ServerDataType>;
}

interface EmailContent {
  to: string;
  subject: string;
  body: string;
}

interface SMSContent {
  to: string;
  body: string;
}

type Content = EmailContent | SMSContent;
