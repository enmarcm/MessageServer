import cors from "cors";
import express from "express";
import midNotJson from "./midNotJson";
import midNotFound from "./midNotFound";
import midValidJson from "./midValidJson";
import midToken from "./midToken";
import { midApiKey } from "./midApiKey";

export const midJson = () => express.json();

export const midCors = () => cors({ credentials: true, origin: "*" });

export { midNotJson, midNotFound, midValidJson, midApiKey, midToken };
