import { Request, Response } from "express";
import { iNexus } from "../../data/instances";
import { ElementSend } from "../../enums";
import { Content, DataType, NexusQueType } from "../Nexus/NexusTypes";

export default class NexusController {
  private sendToQue = async (type: DataType, content: Content) => {
    const item: NexusQueType = {
      type,
      content,
      status: "PENDING",
    };

    try {
      await iNexus.addQue(item);
      return { message: `${type} sent to the queue` };
    } catch (error: any) {
      console.error(`Error adding ${type} to the queue:`, error);
      throw new Error(`Failed to add ${type} to the queue`);
    }
  };

  static sendMail = async (req: Request, res: Response) => {
    const { to, subject, body } = req.body || {};

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (!NexusController.isValidEmail(to)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const controller = new NexusController();
    try {
      const response = await controller.sendToQue(ElementSend.EMAIL, {
        to,
        subject,
        body,
      });
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  static sendSMS = async (req: Request, res: Response) => {
    const { to, body } = req.body || {};

    if (!to || !body) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (!NexusController.isValidPhoneNumber(to)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const controller = new NexusController();
    try {
      const response = await controller.sendToQue(ElementSend.SMS, {
        to,
        body,
      });
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phone);
  }
}
