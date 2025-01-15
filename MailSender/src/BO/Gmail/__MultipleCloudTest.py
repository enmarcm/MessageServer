import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from .Auth._GmailAuth import authenticate_account  # Importar la función de autenticación

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailWrapper:
    """Wrapper para la API de Gmail que maneja la autenticación y el envío de correos electrónicos."""

    def __init__(self, client_secrets):
        """
        Inicializa el GmailWrapper con un diccionario de archivos de secretos del cliente y una lista de cuentas.

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
        return {account: authenticate_account(account, client_secret_file) for account, client_secret_file in client_secrets.items()}

    def send_email(self, from_email, to, subject, message_text):
        """
        Envía un correo electrónico desde una cuenta autenticada.

        Args:
            from_email (str): El correo electrónico del remitente.
            to (str): El correo electrónico del destinatario.
            subject (str): El asunto del correo electrónico.
            message_text (str): El cuerpo del correo electrónico.

        Returns:
            dict: Respuesta de la API de Gmail.
        """
        if from_email not in self.services:
            print(f'No credentials found for {from_email}')
            return None

        service = self.services[from_email]
        message = MIMEText(message_text)
        message['to'] = to
        message['from'] = from_email
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

        message = {
            'raw': raw
        }

        try:
            message = (service.users().messages().send(userId="me", body=message).execute())
            print(f'Message Id: {message["id"]}')
            return message
        except Exception as error:
            print(f'An error occurred: {error}')
            return None