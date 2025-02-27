import { Request, Response } from "express";
import { iNexus } from "../../data/instances";
import { ElementSend } from "../../enums";
import { ReqRes } from "../../types";
import { Content, DataType, NexusQueType } from "../Nexus/NexusTypes";
export default class NexusController {
  private sendToQue = (type: DataType, content: Content) => {
    const item: NexusQueType = {
      type,
      content,
      status: "PENDING",
    };

    iNexus.addQue(item);
    return { message: `${type} sent to the queue` };
  };

  static sendMail = async (req: Request, res: Response) => {
    const { to, subject, body } = req.body || {};

    if (to === undefined || subject === undefined || body === undefined) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const controller = new NexusController();
    const response = controller.sendToQue(ElementSend.EMAIL, {
      to,
      subject,
      body,
    });
    return res.json(response);
  };

  static sendSMS = async (item: ReqRes) => {
    const { req, res } = item;
    const { to, body } = req.body || {};

    const controller = new NexusController();
    const response = controller.sendToQue(ElementSend.SMS, { to, body });
    return res.json(response);
  };
}
