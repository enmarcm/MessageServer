import { Router } from "express";
import AuthController from "../BO/controllers/AuthController";

export const AuthRouter = Router();

AuthRouter.post("/login", AuthController.login);
