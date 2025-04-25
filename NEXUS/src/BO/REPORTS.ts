import { iPgHandler, ITSGooseHandler } from "../data/instances";
import { DataModel, QueueItemModel } from "./TGoose/models";

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
        limit: 50, // Ajustar límite
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
      limit: 50, // Ajustar límite
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
 * @returns {Promise<{ time: string; value: number }[]>} Lista de correos enviados por día.
 */
async get_emails_sent_by_day(): Promise<{ time: string; value: number }[]> {
  try {
    const emails = await ITSGooseHandler.searchAll({
      Model: QueueItemModel,
      condition: { type: "EMAIL", status: "COMPLETED" },
      limit: 10000, // Ajustar límite
    });

    const grouped_by_day: Record<string, number> = emails.reduce(
      (acc: Record<string, number>, email: any) => {
        const date = new Date(email.createdAt); // Convertir a objeto Date
        const formattedDate = date.toISOString().split("T")[0]; // Extraer solo la fecha en formato YYYY-MM-DD
        acc[formattedDate] = (acc[formattedDate] || 0) + 1; // Incrementar el contador por fecha
        return acc;
      },
      {}
    );

    // Convertir el objeto agrupado en un arreglo con el formato solicitado
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
 * @returns {Promise<{ time: string; value: number }[]>} Lista de mensajes enviados por día.
 */
async get_sms_sent_by_day(): Promise<{ time: string; value: number }[]> {
  try {
    const sms = await ITSGooseHandler.searchAll({
      Model: QueueItemModel,
      condition: { type: "SMS", status: "COMPLETED" },
      limit: 10000, // Ajustar límite
    });

    const grouped_by_day: Record<string, number> = sms.reduce(
      (acc: Record<string, number>, message: any) => {
        const date = new Date(message.createdAt); // Convertir a objeto Date
        const formattedDate = date.toISOString().split("T")[0]; // Extraer solo la fecha en formato YYYY-MM-DD
        acc[formattedDate] = (acc[formattedDate] || 0) + 1; // Incrementar el contador por fecha
        return acc;
      },
      {}
    );

    // Convertir el objeto agrupado en un arreglo con el formato solicitado
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

  async get_data_for_cards_dashboard({id_user}: { id_user: number }) {
    try {
      // Consulta en MongoDB para obtener SMS y EMAIL
      const smsData = await ITSGooseHandler.searchAll({
        Model: DataModel,
        condition: { type: "SMS" },
      });

      const emailData = await ITSGooseHandler.searchAll({
        Model: DataModel,
        condition: { type: "EMAIL" },
      });

      // Formatear los datos de MongoDB
      const SMS = smsData.map((item: any) => ({
        name: item.name,
        rest: item.rest || null, // Manejar rest como opcional
      }));

      const EMAIL = emailData.map((item: any) => ({
        name: item.name,
        rest: item.rest || null, // Manejar rest como opcional
      }));

      const templatesResult = await iPgHandler.executeQuery({
        key: "getAllTemplates",
        params: [id_user],
      });

      const groupsResult = await iPgHandler.executeQuery({
        key: "obtainAllGroup"
      });

      console.log("templatesResult", templatesResult);
      console.log("groupsResult", groupsResult);

      if (!Array.isArray(templatesResult)) {
        throw new Error(
          `Unexpected response structure: ${JSON.stringify(templatesResult)}`
        );
      }

      if (!Array.isArray(groupsResult)) {
        throw new Error(
          `Unexpected response structure: ${JSON.stringify(groupsResult)}`
        );
      }

      // Formatear los datos de PostgreSQL
      const TEMPLATES = templatesResult.map((template: any) => ({
        id: template.id_template,
        name: template.name,
        type: template.type,
      }));

      const GROUPS = groupsResult.map((group: any) => ({
        id: group.id_group,
        name: group.de_group,
        members: group.total_saved,
        type: group.de_type,
      }));

      // Estructura final de la respuesta
      return {
        SMS,
        EMAIL,
        TEMPLATES,
        GROUPS,
      };
    } catch (error) {
      console.error(`Error getting data for dashboard cards: ${error}`);
      throw error;
    }
  }
}
