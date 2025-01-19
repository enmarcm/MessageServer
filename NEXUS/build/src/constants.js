"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_URL = exports.PORT = void 0;
require("dotenv/config");
exports.PORT = Number(process.env.PORT_API) || 3030;
// export const BASE_URL:string = process.env.BASE_URL || `http://localhost:${PORT}`;
exports.BASE_URL = process.env.BASE_URL || `http://192.168.109.126:${exports.PORT}`;
