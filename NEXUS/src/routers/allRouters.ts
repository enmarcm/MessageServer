import { Router } from "express";
import { ReqRes } from "../types";
import { iNexus, logger } from "../data/instances";

export const MainRouter = Router();

MainRouter.get("/", async (data: ReqRes) => {
  const result = await iNexus.sendMail({
    email: "hermandad@yahoo.com",
    subject: "Prueba",
    body: "Este es un contenido del correo, nos avisa que tal",
  });

  logger.log(result)

  data.res.send(`<h1>Este fue el resultado${JSON.stringify(result)}</h1>`);
});

MainRouter.get("/showLogs", async(data: ReqRes)=>{
  const logs = await logger.getAllLogs();
  data.res.json(logs)
})