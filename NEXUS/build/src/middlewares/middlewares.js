"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.midValidJson = exports.midNotFound = exports.midNotJson = exports.midCors = exports.midJson = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const midNotJson_1 = __importDefault(require("./midNotJson"));
exports.midNotJson = midNotJson_1.default;
const midNotFound_1 = __importDefault(require("./midNotFound"));
exports.midNotFound = midNotFound_1.default;
const midValidJson_1 = __importDefault(require("./midValidJson"));
exports.midValidJson = midValidJson_1.default;
const midJson = () => express_1.default.json();
exports.midJson = midJson;
const midCors = () => (0, cors_1.default)({ credentials: true, origin: "*" });
exports.midCors = midCors;
