// In this file is where we define the instances of the classes that we want to use in our application.

import dotenv from 'dotenv';
dotenv.config();

import LogHistory from "../BO/LogHistory/LogHistory";
import Nexus from "../BO/Nexus/_NexusProto";

export const iNexus = new Nexus();

const uri = process.env.URI_MONGO || "";
const collectionName = process.env.COLLECTION_LOGS || "";

export const logger = new LogHistory(uri, collectionName);