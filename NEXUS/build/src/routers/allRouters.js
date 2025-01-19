"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
const instances_1 = require("../data/instances");
const CryptManager_1 = __importDefault(require("../utils/CryptManager"));
exports.MainRouter = (0, express_1.Router)();
exports.MainRouter.get("/", (data) => __awaiter(void 0, void 0, void 0, function* () {
    const emailAddresses = [
        // "miguel.29877776@uru.edu",
        // "miguelguillendg@gmail.com",
        "enmanuel.29955728@uru.edu",
        "Bypaolasayago@gmail.com"
    ];
    const getRandomLore = () => __awaiter(void 0, void 0, void 0, function* () { return yield CryptManager_1.default.encryptBcrypt({ data: "aqui algo hay" }); });
    const sendEmails = () => __awaiter(void 0, void 0, void 0, function* () {
        for (const email of emailAddresses) {
            for (let i = 1; i <= 5; i++) {
                yield instances_1.iNexus.sendMail({
                    to: email,
                    subject: `Subject ${i} for ${email}`,
                    body: `Body ${i} for ${email}: ${yield getRandomLore()}, nos avisa que tal`,
                });
            }
        }
    });
    sendEmails().catch((error) => {
        console.error("Error sending emails:", error);
    });
    data.res.send(`<h1>Creo que si se envio</h1>`);
}));
exports.MainRouter.get("/showLogs", (data) => __awaiter(void 0, void 0, void 0, function* () {
    const logs = yield instances_1.logger.getAllLogs();
    data.res.json(logs);
}));
