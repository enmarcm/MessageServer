import { Router } from "express";
import { ReqRes } from "../types";
import { iNexus, logger } from "../data/instances";

export const MainRouter = Router();

MainRouter.get("/", async (data: ReqRes) => {
   await iNexus.sendMail({
    to: "hermandad@yahoo.com",
    subject: "Prueba",
    body: "Este es un contenido del correo, nos avisa que tal",
  });


  data.res.send(`<h1>Creo que si se envio</h1>`);
});

MainRouter.get("/showLogs", async(data: ReqRes)=>{
  const logs = await logger.getAllLogs();
  data.res.json(logs)
})