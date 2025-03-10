import "dotenv/config";

import { CONNECTION_STRING, JWT_CONFIG } from "../constants";
import TSGooseHandler from "../utils/TSGooseHandler";
export const ITSGooseHandler = new TSGooseHandler(CONNECTION_STRING);

import Nexus from "../BO/Nexus/Nexus";
import JWTManager from "../utils/JWTManager";

import LogHistory from "../BO/LogHistory/LogHistory";
import PgHandler from "../utils/PgHandler";
import config from "../config.json";
import querys from "../data/jsons/querys.json";

const data = [
  {
    type: "EMAIL" as const,
    content: "theenmanuel123@gmail.com",
    status: "ACTIVE" as const,
    rest: 1000,
    credentials: {},
  },
];

const servers = [
  {
    name: "MailServer1",
    host: "0.0.0.0",
    port: 50051,
    status: "ONLINE" as const,
    use: "FREE" as const,
    typeInfo: "EMAIL" as const,
  },
];

export const iNexus = new Nexus({ data, servers });

export const logger = new LogHistory();

export const IJWTManager = new JWTManager(JWT_CONFIG);

export const iPgHandler = new PgHandler({ config: config.database, querys });
