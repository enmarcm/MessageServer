import { Router } from "express";
import { ReqRes } from "../types";
import { iNexus, logger } from "../data/instances";
import CryptManager from "../utils/CryptManager";

export const MainRouter = Router();

MainRouter.get("/", async (data: ReqRes) => {
  const emailAddresses = [
    // "miguel.29877776@uru.edu",
    // "miguelguillendg@gmail.com",
    // "alejandromerchanserrano@gmail.com",
    // "enmanuel.29955728@uru.edu",
    "enmanuelcolina547@gmail.com"
    // "Bypaolasayago@gmail.com"
  ];

  const getRandomLore = async () =>
    await CryptManager.encryptBcrypt({ data: "aqui algo hay" });

  const sendEmails = async () => {
    for (const email of emailAddresses) {
      for (let i = 1; i <= 5; i++) {
        iNexus.addQue({
          type: "EMAIL",
          content: {
            to: email,
            subject: `INTENTAMOS ${i} for ${email}`,
            body: `Body ${i} for ${email}: ${await getRandomLore()}, nos avisa que tal`,
          },
        });

      }
    }
  };

  sendEmails().catch((error) => {
    console.error("Error sending emails:", error);
  });

  data.res.send(`<h1>Creo que si se envio</h1>`);
});

MainRouter.get("/showLogs", async (data: ReqRes) => {
  const logs = await logger.getAllLogs();
  data.res.json(logs);
});
