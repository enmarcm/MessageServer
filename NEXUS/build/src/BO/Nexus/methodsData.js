"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServerStatsValues = exports.SendMailValues = void 0;
const package_data_json_1 = __importDefault(require("../../data/jsons/package-data.json"));
const SendMailValues = ({ protoPath, target, }) => {
    const objectValue = Object.assign(Object.assign({}, package_data_json_1.default.sendMail), { protoPath,
        target });
    return objectValue;
};
exports.SendMailValues = SendMailValues;
const GetServerStatsValues = ({ protoPath, target, }) => {
    const objectValue = Object.assign(Object.assign({}, package_data_json_1.default.getServerStats), { protoPath,
        target });
    return objectValue;
};
exports.GetServerStatsValues = GetServerStatsValues;
