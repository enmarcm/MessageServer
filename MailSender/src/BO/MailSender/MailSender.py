from utils.Attachment import add_attachment
from BO.Gmail.GmailWrapper import GmailWrapper
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

    def build_message(self, from_email, destination, obj, body, is_html=False, attachments=[]):
        """
        Construye un mensaje de correo electrónico.

        Args:
            from_email (str): El correo electrónico del remitente.
            destination (str): El correo electrónico del destinatario.
            obj (str): El asunto del correo electrónico.
            body (str): El cuerpo del correo electrónico.
            is_html (bool): Indica si el cuerpo del correo electrónico es HTML.
            attachments (list): Lista de archivos adjuntos.

        Returns:
            dict: Mensaje de correo electrónico codificado en base64.
        """
        if not attachments:  # no attachments given
            message = MIMEText(body, 'html' if is_html else 'plain')
            message['to'] = destination
            message['from'] = from_email
            message['subject'] = obj
        else:
            message = MIMEMultipart()
            message['to'] = destination
            message['from'] = from_email
            message['subject'] = obj
            message.attach(MIMEText(body, 'html' if is_html else 'plain'))
            for filename in attachments:
                add_attachment(message, filename)
        return {'raw': urlsafe_b64encode(message.as_bytes()).decode()}

    def send_message(self, from_email, destination, obj, body, is_html=True, attachments=[]):
        """
        Envía un mensaje de correo electrónico utilizando GmailWrapper.

        Args:
            from_email (str): El correo electrónico del remitente.
            destination (str): El correo electrónico del destinatario.
            obj (str): El asunto del correo electrónico.
            body (str): El cuerpo del correo electrónico.
            is_html (bool): Indica si el cuerpo del correo electrónico es HTML.
            attachments (list): Lista de archivos adjuntos.

        Returns:
            dict: Respuesta de la API de Gmail.
        """
        message = self.build_message(from_email, destination, obj, body, is_html, attachments)
        return self.gmail_wrapper.send_email(from_email, destination, obj, body, is_html)