import "dotenv/config";
import config from "./config.json";

export const PORT = Number(process.env.PORT_API) || 3030;

// export const BASE_URL:string = process.env.BASE_URL || `http://localhost:${PORT}`;

export const BASE_URL: string =
  process.env.BASE_URL || `http://192.168.109.126:${PORT}`;

export const CONNECTION_STRING = {
  connectionString: "mongodb+srv://enmarmc:hwrsNZ9QxE1hmWp6@myfirst.qscs2is.mongodb.net/LogHistory?retryWrites=true&w=majority&appName=MyFirst"
}

export const JWT_CONFIG = {
  SECRET_WORD: process.env.SECRET_WORD as string ,
  expiresIn: config.security.JWT.expiresIn as string ,
};

export enum SMSNumber {
  mainNumber = "+584121704005",
}