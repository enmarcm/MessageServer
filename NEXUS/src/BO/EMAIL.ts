import { iNexus } from "../data/instances";

export class EMAIL {
  send_email(to: string, subject: string, body: string) {
    try {
      const response = iNexus.addQue({
        type: "EMAIL",
        content: {
          to,
          subject,
          body,
        },
        status: "PENDING",
      });
      return {
        message: `EMAIL sent to the queue`,
        response,
      };
    } catch (error: any) {
      console.error(`Error adding EMAIL to the queue:`, error);
      throw new Error(`Failed to add EMAIL to the queue`);
    }
  }

  send_email_with_template() {}

  send_email_with_file_and_template() {}

  send_email_with_template_to_group() {}

  send_email_with_data_and_custom() {}
}
