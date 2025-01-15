from ...utils.Attachment import add_attachment
from ..Gmail.__MultipleCloudTest import GmailWrapper
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from mimetypes import guess_type as guess_mime_type
from base64 import urlsafe_b64encode

class MailSender:
    def __init__(self, client_secrets):
        """
        Inicializa el MailSender con un diccionario de archivos de secretos del cliente y una lista de cuentas.

        Args:
            client_secrets (dict): Diccionario donde las claves son correos electrónicos y los valores son rutas a archivos client_secret.json.
        """
        self.gmail_wrapper = GmailWrapper(client_secrets)

    def build_message(self, from_email, destination, obj, body, attachments=[]):
        """
        Construye un mensaje de correo electrónico.

        Args:
            from_email (str): El correo electrónico del remitente.
            destination (str): El correo electrónico del destinatario.
            obj (str): El asunto del correo electrónico.
            body (str): El cuerpo del correo electrónico.
            attachments (list): Lista de archivos adjuntos.

        Returns:
            dict: Mensaje de correo electrónico codificado en base64.
        """
        if not attachments:  # no attachments given
            message = MIMEText(body)
            message['to'] = destination
            message['from'] = from_email
            message['subject'] = obj
        else:
            message = MIMEMultipart()
            message['to'] = destination
            message['from'] = from_email
            message['subject'] = obj
            message.attach(MIMEText(body))
            for filename in attachments:
                add_attachment(message, filename)
        return {'raw': urlsafe_b64encode(message.as_bytes()).decode()}

    def send_message(self, from_email, destination, obj, body, attachments=[]):
        """
        Envía un mensaje de correo electrónico utilizando GmailWrapper.

        Args:
            from_email (str): El correo electrónico del remitente.
            destination (str): El correo electrónico del destinatario.
            obj (str): El asunto del correo electrónico.
            body (str): El cuerpo del correo electrónico.
            attachments (list): Lista de archivos adjuntos.

        Returns:
            dict: Respuesta de la API de Gmail.
        """
        message = self.build_message(from_email, destination, obj, body, attachments)
        return self.gmail_wrapper.send_email(from_email, destination, obj, body)

# Ejemplo de uso:
if __name__ == "__main__":
    client_secrets = {
        "theenmaneul123@gmail.com": "MailSender/src/BO/Gmail/Auth/credentials.json",
    }

    mail_sender = MailSender(client_secrets)

    # Enviar un correo desde una cuenta específica
    response = mail_sender.send_message(
        from_email="theenmanuel123@gmail.com",
        destination="enmanuel.29955728@uru.edu",
        obj="Test Subject",
        body="This is a test email.",
        attachments=[]
    )

    if response:
        print("Email sent successfully")
    else:
        print("Failed to send email")