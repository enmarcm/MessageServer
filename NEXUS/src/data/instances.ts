import "dotenv/config";

import { CONNECTION_STRING, JWT_CONFIG } from "../constants";
import TSGooseHandler from "../utils/TSGooseHandler";
export const ITSGooseHandler = new TSGooseHandler(CONNECTION_STRING);

import Nexus from "../BO/Nexus/Nexus";
import JWTManager from "../utils/JWTManager";
import PgHandler from "../utils/PgHandler";
import config from "../config.json";
import querys from "../data/jsons/querys.json";
import Security from "../utils/Security";
import PermissionController from "../BO/controllers/PermissionController";
import { logHistory } from "../BO/LogHistory/LogHistory";

export const iNexus = new Nexus({
  data: config.Nexus.data as any,
  servers: config.Nexus.servers as any,
});

export const logger = logHistory

export const IJWTManager = new JWTManager(JWT_CONFIG);

export const iPgHandler = new PgHandler({ config: config.database, querys });

export const iSecurity = new Security({
  controller: PermissionController,
  config: config.security.moduleSecurity,
});
