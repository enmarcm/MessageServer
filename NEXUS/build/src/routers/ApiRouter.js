"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRouter = void 0;
const express_1 = require("express");
const NexusController_1 = __importDefault(require("../BO/controllers/NexusController"));
exports.ApiRouter = (0, express_1.Router)();
exports.ApiRouter.post("/sendMail", NexusController_1.default.sendMail);
exports.ApiRouter.post("/sendSMS", NexusController_1.default.sendSMS);
