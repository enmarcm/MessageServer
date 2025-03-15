import { ITSGooseHandler } from "../data/instances";
import { QueueItemModel } from "./TGoose/models";

export default class Reports {
  /**
   * Obtiene todos los envíos de SMS.
   * @returns {Promise<any[]>} Lista de envíos de SMS.
   */
  async obtainSMSSends(): Promise<any[]> {
    try {
      const smsSends = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS" },
      });
      return smsSends;
    } catch (error) {
      console.error(`Error obtaining SMS sends: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene todos los envíos de correos electrónicos.
   * @returns {Promise<any[]>} Lista de envíos de correos electrónicos.
   */
  async obtainEmailSends(): Promise<any[]> {
    try {
      const emailSends = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL" },
      });
      return emailSends;
    } catch (error) {
      console.error(`Error obtaining email sends: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene los SMS exitosos y fallidos.
   * @returns {Promise<{ success: any[], failed: any[] }>} Lista de SMS exitosos y fallidos.
   */
  async obtainSuccessAndFailedSMS(): Promise<{
    success: any[];
    failed: any[];
  }> {
    try {
      const successSMS = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "COMPLETED" },
      });
      const failedSMS = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "SMS", status: "ERROR" },
      });
      return { success: successSMS, failed: failedSMS };
    } catch (error) {
      console.error(`Error obtaining success and failed SMS: ${error}`);
      return { success: [], failed: [] };
    }
  }

  /**
   * Obtiene los correos electrónicos exitosos y fallidos.
   * @returns {Promise<{ success: any[], failed: any[] }>} Lista de correos electrónicos exitosos y fallidos.
   */
  async obtainSuccessAndFailedEmail(): Promise<{
    success: any[];
    failed: any[];
  }> {
    try {
      const successEmail = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "COMPLETED" },
      });
      const failedEmail = await ITSGooseHandler.searchAll({
        Model: QueueItemModel,
        condition: { type: "EMAIL", status: "ERROR" },
      });
      return { success: successEmail, failed: failedEmail };
    } catch (error) {
      console.error(`Error obtaining success and failed email: ${error}`);
      return { success: [], failed: [] };
    }
  }
}
