import dotenv from "dotenv";
dotenv.config();

import LogHistory from "../BO/LogHistory/LogHistory";
import Nexus from "../BO/Nexus/Nexus";

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

const uri = process.env.URI_MONGO || "";
const collectionName = process.env.COLLECTION_LOGS || "";

export const logger = new LogHistory(uri, collectionName);