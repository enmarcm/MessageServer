import { Router } from "express";
import AuthController from "../BO/Auth/AuthController";

export const AuthRouter = Router();

AuthRouter.post("", AuthController.login);
