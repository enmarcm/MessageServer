import { ITSGooseHandler } from "../data/instances";
import { QueueItemModel } from "./TGoose/models";

export default class Reports {
  /**
   * Obtiene todos los envíos de SMS.
   * @returns {Promise<any[]>} Lista de envíos de SMS.
   */
  async obtain_sms_sends(): Promise<any[]> {
    try {
      const sms_sends = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS" },
      });
      return sms_sends;
    } catch (error) {
      console.error(`Error obtaining SMS sends: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene todos los envíos de correos electrónicos.
   * @returns {Promise<any[]>} Lista de envíos de correos electrónicos.
   */
  async obtain_email_sends(): Promise<any[]> {
    try {
      const email_sends = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL" },
      });
      return email_sends;
    } catch (error) {
      console.error(`Error obtaining email sends: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los SMS exitosos y fallidos.
   * @returns {Promise<{ success: any[], failed: any[] }>} Lista de SMS exitosos y fallidos.
   */
  async obtain_success_and_failed_sms(): Promise<{
    success: any[];
    failed: any[];
  }> {
    try {
      const success_sms = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "COMPLETED" },
      });
      const failed_sms = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "ERROR" },
      });
      return { success: success_sms, failed: failed_sms };
    } catch (error) {
      console.error(`Error obtaining success and failed SMS: ${error}`);
      return { success: [], failed: [] };
    }
  }

  /**
   * Obtiene los correos electrónicos exitosos y fallidos.
   * @returns {Promise<{ success: any[], failed: any[] }>} Lista de correos electrónicos exitosos y fallidos.
   */
  async obtain_success_and_failed_email(): Promise<{
    success: any[];
    failed: any[];
  }> {
    try {
      const success_email = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "COMPLETED" },
      });
      const failed_email = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "ERROR" },
      });
      return { success: success_email, failed: failed_email };
    } catch (error) {
      console.error(`Error obtaining success and failed email: ${error}`);
      return { success: [], failed: [] };
    }
  }

  async obtain_all_queue_items(): Promise<any[]> {
    try {
      const all_queue_items = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: {},
      });
      return all_queue_items;
    } catch (error) {
      console.error(`Error obtaining all queue items: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los correos enviados por día.
   * @returns {Promise<{ time: string, value: number }[]>} Lista de correos enviados por día.
   */
  async get_emails_sent_by_day(): Promise<{ time: string; value: number }[]> {
    try {
      const emails = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "COMPLETED" },
      });

      const grouped_by_day: Record<string, number> = emails.reduce(
        (acc: Record<string, number>, email: any) => {
          const date = new Date(email.createdAt).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {}
      );

      return Object.entries(grouped_by_day).map(([time, value]) => ({
        time,
        value,
      }));
    } catch (error) {
      console.error(`Error getting emails sent by day: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los mensajes enviados por día.
   * @returns {Promise<{ time: string, value: number }[]>} Lista de mensajes enviados por día.
   */
  async get_sms_sent_by_day(): Promise<{ time: string; value: number }[]> {
    try {
      const sms = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "COMPLETED" },
      });

      const grouped_by_day: Record<string, number> = sms.reduce(
        (acc: Record<string, number>, message: any) => {
          const date = new Date(message.createdAt).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {}
      );

      return Object.entries(grouped_by_day).map(([time, value]) => ({
        time,
        value,
      }));
    } catch (error) {
      console.error(`Error getting SMS sent by day: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los correos exitosos y fallidos.
   * @returns {Promise<{ value: number, name: string, color: string }[]>} Lista de correos exitosos y fallidos.
   */
  async get_email_success_and_failed(): Promise<
    { value: number; name: string; color: string }[]
  > {
    try {
      const success_count = await ITSGooseHandler.countDocuments({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "COMPLETED" },
      });

      const failed_count = await ITSGooseHandler.countDocuments({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "ERROR" },
      });

      return [
        { value: +success_count, name: "Exitosos", color: "#2FE5A7" },
        { value: +failed_count, name: "Fallidos", color: "#FF69B4" },
      ];
    } catch (error) {
      console.error(`Error getting email success and failed: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los mensajes exitosos y fallidos.
   * @returns {Promise<{ value: number, name: string, color: string }[]>} Lista de mensajes exitosos y fallidos.
   */
  async get_sms_success_and_failed(): Promise<
    { value: number; name: string; color: string }[]
  > {
    try {
      const success_count = await ITSGooseHandler.countDocuments({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "COMPLETED" },
      });

      const failed_count = await ITSGooseHandler.countDocuments({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "ERROR" },
      });

      return [
        { value: +success_count, name: "Exitosos", color: "#2FE5A7" },
        { value: +failed_count, name: "Fallidos", color: "#FF69B4" },
      ];
    } catch (error) {
      console.error(`Error getting SMS success and failed: ${error}`);
      return [];
    }
  }
}