import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from .Auth.GmailAuth import authenticate_account
from utils.Attachment import add_attachment

# Agregar el alcance necesario para leer correos
SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']

class GmailWrapper:
    def __init__(self, client_secrets):
        """
        Inicializa el GmailWrapper con las credenciales del cliente.

        Args:
            client_secrets (dict): Diccionario donde las claves son correos electrónicos y los valores son rutas a archivos client_secret.json.
        """
        self.client_secrets = client_secrets
        self.services = self.authenticate_all_accounts(client_secrets)

    def authenticate_all_accounts(self, client_secrets):
        """
        Autentica todas las cuentas proporcionadas.

        Args:
            client_secrets (dict): Diccionario donde las claves son correos electrónicos y los valores son rutas a archivos client_secret.json.

        Returns:
            dict: Diccionario de servicios de la API de Gmail autenticados.
        """
        return {account: authenticate_account(account, client_secret_file, SCOPES) for account, client_secret_file in client_secrets.items()}

    def send_email(self, from_email, to, subject, message_text, is_html=False, attachments=[]):
        """
        Envía un correo electrónico desde una cuenta autenticada.

        Args:
            from_email (str): Dirección del remitente.
            to (str): Dirección del destinatario.
            subject (str): Asunto del correo.
            message_text (str): Cuerpo del correo.
            is_html (bool): Indica si el cuerpo del correo es HTML.
            attachments (list): Lista de archivos adjuntos. Cada adjunto debe ser un diccionario con 'filename' y 'content'.

        Returns:
            dict: Respuesta de la API de Gmail.
        """
        if from_email not in self.services:
            print(f'No credentials found for {from_email}')
            return None

        if not to or to.strip() == "":  # Validar que el destinatario no esté vacío
            print("Error: Recipient address is required.")
            return None

        service = self.services[from_email]
        message = MIMEMultipart() if attachments else MIMEText(message_text, 'html' if is_html else 'plain')
        message['to'] = to
        message['from'] = from_email
        message['subject'] = subject

        if attachments:
            message.attach(MIMEText(message_text, 'html' if is_html else 'plain'))
            for attachment in attachments:
                add_attachment(message, attachment['filename'], attachment['content'])

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

        try:
            return service.users().messages().send(userId="me", body={'raw': raw}).execute()
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None

    def check_bounce_status(self, from_email, to, sent_time=None):
        """
        Verifica si un correo enviado tuvo un rebote.

        Args:
            from_email (str): Dirección del remitente.
            to (str): Dirección del destinatario.
            sent_time (str): Hora de envío del correo (ISO 8601).

        Returns:
            dict: Estado del correo ("failed", "completed") y razón del fallo (si aplica).
        """
        if from_email not in self.services:
            return {"status": "failed", "reason": f"No credentials found for {from_email}"}

        service = self.services[from_email]
        try:
            # Buscar mensajes con el remitente mailer-daemon@googlemail.com
            query = f"from:mailer-daemon@googlemail.com"
            print(f"Executing query: {query}")  # Log para depuración
            results = service.users().messages().list(userId='me', q=query).execute()
            messages = results.get('messages', [])

            if not messages:
                print("No bounce messages found.")  # Log para depuración
                return {"status": "completed", "reason": ""}

            for message in messages:
                msg = service.users().messages().get(userId='me', id=message['id']).execute()
                payload = msg.get('payload', {})
                headers = payload.get('headers', [])
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
                snippet = msg.get('snippet', '')

                # Log para depuración
                print(f"Checking message: Subject={subject}, Snippet={snippet}")

                # Verificar si el cuerpo del mensaje contiene el destinatario original
                if to.lower() in snippet.lower():
                    print(f"Bounce detected for recipient: {to}")  # Log para depuración
                    return {"status": "failed", "reason": "Bounce detected"}

            # Si no se detecta rebote, marcar como completado
            print("No bounce detected after checking all messages.")  # Log para depuración
            return {"status": "completed", "reason": ""}
        except HttpError as error:
            print(f"An error occurred: {error}")  # Log para depuración
            return {"status": "failed", "reason": f"An error occurred: {error}"}