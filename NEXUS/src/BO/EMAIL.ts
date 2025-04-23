import { iNexus } from "../data/instances";
import { DataType, NexusQueType } from "./Nexus/NexusTypes";
import path from "path";
import fs from "fs";

export class EMAIL {
  /**
   * Envía un correo electrónico individual.
   * @param to - Dirección de correo del destinatario.
   * @param subject - Asunto del correo.
   * @param body - Cuerpo del correo.
   * @param attachments - Lista de nombres de archivos adjuntos.
   * @returns {Promise<{ message: string; response: any }>}
   */
  send_email(
    to: string,
    subject: string,
    body: string,
    attachments?: { filename: string }[]
  ) {
    try {
      // Procesar los archivos adjuntos desde la carpeta uploads
      const processedAttachments = attachments?.map((attachment) => {
        const filePath = path.join(
          __dirname,
          "../../uploads",
          attachment.filename
        ); // Ruta del archivo
        if (!fs.existsSync(filePath)) {
          throw new Error(`Attachment file not found: ${attachment.filename}`);
        }
        return {
          filename: attachment.filename,
          content: fs.readFileSync(filePath), // Leer el contenido del archivo
        };
      });

      const response = iNexus.addQue({
        type: "EMAIL",
        content: {
          to,
          subject,
          body,
          attachments: processedAttachments, 
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

  /**
   * Envía múltiples correos electrónicos.
   * @param emails - Lista de correos electrónicos a enviar.
   * @returns {Promise<{ message: string; response: any }>}
   *
   * ### Ejemplo de petición:
   * ```json
   * {
   *   "object": "EMAIL",
   *   "method": "send_multiple_emails",
   *   "params": [
   *     {
   *       "emails": [
   *         {
   *           "type": "EMAIL",
   *           "content": {
   *             "to": "enmamata96@gmail.com",
   *             "subject": "ESTE ES UNA PRUEBA DE TESIS",
   *             "body": "<h1>Texto en bold>\n<img src='https://concepto.de/wp-content/uploads/2018/10/URL1-e1538664720680-800x400.jpg'/>",
   *             "attachments": [
   *               { "filename": "test.txt" },
   *               { "filename": "image.png" }
   *             ]
   *           },
   *           "status": "PENDING"
   *         },
   *         {
   *           "type": "EMAIL",
   *           "content": {
   *             "to": "example1@gmail.com",
   *             "subject": "Segundo correo de prueba",
   *             "body": "<p>Este es el cuerpo del segundo correo.</p>"
   *           },
   *           "status": "PENDING"
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   */
  async send_multiple_emails({ emails }: { emails: NexusQueType[] }) {
    try {
      const emailQueueItems = emails.map((email: any) => {

        console.log("MUESTRO LOS ATTACHMENTS EN EL SERVIDOR");
        console.log(email.content.attachments);
        console.log("---------------")

        const processedAttachments = email.content.attachments?.map(
          (attachment: { fileName: string }) => {
            if (!attachment || !attachment.fileName) {
              throw new Error(`Attachment is missing a valid fileName`);
            }

            const filePath = path.join(
              __dirname,
              "./../../uploads",
              attachment.fileName
            );

            console.log("MUESTRO EL PATH DEL ARCHIVO EN EL SERVIDOR")
            console.log(filePath);
            console.log(fs.readFileSync(filePath));
            console.log("---------------");

            if (!fs.existsSync(filePath)) {
              throw new Error(
                `Attachment file not found: ${attachment.fileName}`
              );
            }

            return {
              filename: attachment.fileName,
              content: fs.readFileSync(filePath), 
            };
          }
        );

        const data = {
          type: "EMAIL" as DataType,
          content: {
            ...email.content,
            attachments: processedAttachments, 
          },
          status: "PENDING" as "PENDING",
        } as any;

        return data;
      });

      const response = await iNexus.addMultipleQue(emailQueueItems);

      return {
        message: `${emails.length} EMAIL(s) sent to the queue`,
        response,
      };
    } catch (error: any) {
      console.error(`Error adding multiple EMAILs to the queue:`, error);
      throw new Error(`Failed to add multiple EMAILs to the queue`);
    }
  }
}
