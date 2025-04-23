import express from "express";
import { startServer } from "./functions";
import {
  midApiKey,
  midCors,
  midJson,
  midNotFound,
  midNotJson,
  midToken,
  midValidJson,
} from "./middlewares/middlewares";
import { PORT } from "./constants";
import { AuthRouter, MainRouter } from "./routers/allRouters";
import { ApiRouter } from "./routers/ApiRouter";
import { toProcessRouter } from "./routers/toProcessRouter";
import path from "path";
import { UploadRouter } from "./routers/FileRouter";
import fs from "fs";

export const app = express();

//{ Middlewares

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use(midJson());
app.use(midValidJson);
app.use(midCors());
app.use(midNotJson);

app.use("/", MainRouter);
app.use("/auth", AuthRouter)

/**
 * @example
 * /api/sendMail
 * /api/sendSMS
 * -H "x-api-key : 123456"
*/
app.use("/api", midApiKey, ApiRouter);
app.use("/upload", UploadRouter)
app.use("/toProcess", midToken, toProcessRouter)
app.use(midNotFound);

startServer({ app, PORT });
