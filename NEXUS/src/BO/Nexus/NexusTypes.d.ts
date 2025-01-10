export type ElementStatus = "ACTIVE" | "FULL";
export type DataType = "SMS" | "EMAIL";
export type ServerStatus = "ONLINE" | "OFFLINE";
export type NexusQueType = { type: DataType; content: Object };

export type ServerDataType = {
  name: String;
  host: String;
  port: Number;
  status: ServerStatus;
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
