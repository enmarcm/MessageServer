import express from "express";
import { startServer } from "./functions";
import {
  midApiKey,
  midCors,
  midJson,
  midNotFound,
  midNotJson,
  midValidJson,
} from "./middlewares/middlewares";
import { PORT } from "./constants";
import { AuthRouter, MainRouter } from "./routers/allRouters";
import { ApiRouter } from "./routers/ApiRouter";

const app = express();

//{ Middlewares
app.use(express.json());
app.use(midJson());
app.use(midValidJson);
app.use(midCors());
app.use(midNotJson);

app.use("/", MainRouter);
app.use("/login", AuthRouter)
app.use("/api", midApiKey, ApiRouter);

app.use(midNotFound);

startServer({ app, PORT });
