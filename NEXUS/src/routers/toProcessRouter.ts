import { Router } from "express";
import ToProcessController from "../BO/controllers/ToProcessController";

export const toProcessRouter = Router();

toProcessRouter.get("/", ToProcessController.toProcessGet);

toProcessRouter.post("/", ToProcessController.toProcessPost);
