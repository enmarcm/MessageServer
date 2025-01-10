import express from "express";
import { startServer } from "./functions";
import {
  midCors,
  midJson,
  midNotFound,
  midNotJson,
  midValidJson,
} from "./middlewares/middlewares";
import { PORT } from "./constants";
import { MainRouter } from "./routers/allRouters";

const app = express();

//{ Middlewares
app.use(midJson());
app.use(midValidJson);
app.use(midCors());
app.use(midNotJson);

app.use("/", MainRouter);

app.use(midNotFound);


startServer({ app, PORT });
