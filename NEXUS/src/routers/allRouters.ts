import { Router } from "express";
import { ReqRes } from "../types";
import { iNexus } from "../data/instances";

export const MainRouter = Router();

MainRouter.get("/", (data: ReqRes) => {
  const result = iNexus.sendMail({
    email: "parafraseo12@hotmail.com",
    subject: "Hello",
    body: "Hello, world!",
  });

  console.log(result)

  data.res.send(`<h1>Este fue el resultado${JSON.stringify(result)}</h1>`);
});
