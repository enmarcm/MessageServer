import { ObjectId } from "mongoose";

export type ElementStatus = "ACTIVE" | "FULL";
export type DataType = "SMS" | "EMAIL";
export type ServerStatus = "ONLINE" | "OFFLINE";
export type NexusQueType = {
  id?: string | ObjectId;
  type: DataType;
  content: Content;
  status: "PENDING" | "COMPLETED" | "ERROR";
};
export enum DataTypeEnum {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export type ServerDataType = {
  name: String;
  host: String;
  port: number;
  status: ServerStatus;
  use: "FREE" | "BUSSY";
  typeInfo: "SMS" | "EMAIL";
};
export type NexusDataType = {
  type: DataType;
  content: String;
  status: ElementStatus;
  rest: number;
  credentials: Object;
};
export interface ConstructorNexusData {
  data: Array<NexusDataType>;
  servers: Array<ServerDataType>;
}

export interface EmailContent {
  to: string;
  subject: string;
  body: string;
}

export interface SMSContent {
  to: string;
  body: string;
}

export type Content = EmailContent | SMSContent;
