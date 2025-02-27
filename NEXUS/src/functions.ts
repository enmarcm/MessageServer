import { StartServerProps } from "./types";
import picocolors from "picocolors";
import { ITSGooseHandler } from "./data/instances";

export async function startServer({ app, PORT }: StartServerProps) {
  if (!ITSGooseHandler.isConnected){
    await ITSGooseHandler.connectToDB();
    throw new Error("Database connection failed, please try again.");
  }

  app.listen(PORT, () => {
    console.log(
      picocolors.bgBlack(picocolors.green(`SERVER RUNNING ON PORT ${PORT}`))
    );
  });

  return;
}
