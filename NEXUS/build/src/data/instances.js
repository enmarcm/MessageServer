"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.iNexus = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LogHistory_1 = __importDefault(require("../BO/LogHistory/LogHistory"));
const Nexus_1 = __importDefault(require("../BO/Nexus/Nexus"));
const data = [
    {
        type: "EMAIL",
        content: "theenmanuel123@gmail.com",
        status: "ACTIVE",
        rest: 1000,
        credentials: {},
    },
];
const servers = [
    {
        name: "MailServer1",
        host: "0.0.0.0",
        port: 50051,
        status: "ONLINE",
        use: "FREE",
        typeInfo: "EMAIL",
    },
];
exports.iNexus = new Nexus_1.default({ data, servers });
const uri = process.env.URI_MONGO || "";
const collectionName = process.env.COLLECTION_LOGS || "";
exports.logger = new LogHistory_1.default(uri, collectionName);
