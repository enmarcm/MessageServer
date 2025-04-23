import { Router } from "express";
import NexusController from "../BO/controllers/NexusController";


export const ApiRouter = Router();

ApiRouter.post("/sendMail", NexusController.sendMail);
ApiRouter.post("/sendSMS", NexusController.sendSMS);
