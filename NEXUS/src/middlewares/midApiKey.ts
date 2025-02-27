import { Request, Response, NextFunction } from "express";
import ApiKeyHandler from "../utils/ApiKeyHandler";
/**
 * Middleware to validate API key.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const midApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKeyHandler = new ApiKeyHandler();
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey || !apiKeyHandler.validateApiKey(apiKey)) {
    res.status(401).json({ message: "Unauthorized: Invalid API key" });
    return;
  }

  apiKeyHandler.updateApiKeyUsage(apiKey);
  next();
};

export default midApiKey;
