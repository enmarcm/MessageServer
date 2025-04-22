import { iNexus } from "../data/instances";

export class SMS{
    send_sms(to: string, body: string) {
        try {
          const response = iNexus.addQue({
            type: "SMS",
            content: {
              to,
              body,
            },
            status: "PENDING",
          });
          return {
            message: `SMS sent to the queue`,
            response,
          };
        } catch (error: any) {
          console.error(`Error adding SMS to the queue:`, error);
          throw new Error(`Failed to add SMS to the queue`);
        }
      }

    send_sms_group(){}

    
    
}