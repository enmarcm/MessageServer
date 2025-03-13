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

const app = express();

//{ Middlewares
app.use(express.json());
app.use(midJson());
app.use(midValidJson);
app.use(midCors());
app.use(midNotJson);

app.use("/", MainRouter);
app.use("/login", AuthRouter)

/**
 * @example
 * /api/sendMail
 * /api/sendSMS
 * -H "x-api-key : 123456"
 */
app.use("/api", midApiKey, ApiRouter);
app.use("/toProcess", midToken, toProcessRouter)
app.use(midNotFound);

startServer({ app, PORT });
