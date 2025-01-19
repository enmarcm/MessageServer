import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

//TODO: LUEGO HAY QUE HACER QUE AJA, QUE SEA CON BASE DE DATOS ESTO
const apiKeysPath = path.join(__dirname, "../data/jsons/apiKey.json");

const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath, "utf-8")).validApiKeys;

export const midApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["api-key"];

  if (!apiKey) {
    res.status(400).json({ error: "API Key is missing" });
    return;
  }

  if (!apiKeys.includes(apiKey)) {
    res.status(401).json({ error: "Invalid API Key" });
    return;
  }

  next();
};
