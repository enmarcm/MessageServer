import { Router } from "express";
import { ReqRes } from "../types";
import { iNexus } from "../data/instances";

export const MainRouter = Router();

MainRouter.get("/", (_data: ReqRes) => {
  iNexus.sendMail({
    email: "thenmanuel123@gmail.com",
    subject: "Hello",
    body: "Hello, world!",
  });
});
