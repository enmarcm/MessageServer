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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const instances_1 = require("../../data/instances");
const enums_1 = require("../../enums");
class NexusController {
    constructor() {
        this.sendToQue = (type, content) => {
            const item = {
                type,
                content,
            };
            instances_1.iNexus.addQue(item);
            return { message: `${type} sent to the queue` };
        };
    }
}
_a = NexusController;
NexusController.sendMail = (_b) => __awaiter(void 0, [_b], void 0, function* ({ req, res }) {
    const { to, subject, body } = req.body;
    const controller = new _a();
    const response = controller.sendToQue(enums_1.ElementSend.EMAIL, {
        to,
        subject,
        body,
    });
    return res.json(response);
});
NexusController.sendSMS = (_c) => __awaiter(void 0, [_c], void 0, function* ({ req, res }) {
    const { to, body } = req.body;
    const controller = new _a();
    const response = controller.sendToQue(enums_1.ElementSend.SMS, { to, body });
    return res.json(response);
});
exports.default = NexusController;
