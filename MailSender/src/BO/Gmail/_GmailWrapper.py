import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow 
import os
import pickle

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailWrapper:
    """Wrapper para la API de Gmail que maneja la autenticación y el envío de correos electrónicos."""

    def __init__(self, client_secret_file, accounts):
        """
        Inicializa el GmailWrapper con el archivo de secretos del cliente y una lista de cuentas.

        Args:
            client_secret_file (str): Ruta al archivo client_secret.json.
            accounts (list): Lista de correos electrónicos que se autenticarán.
        """
        self.client_secret_file = client_secret_file
        self.services = self.authenticate_all_accounts(accounts)

    def authenticate_account(self, account_name):
        """
        Autentica una cuenta de Gmail y devuelve el servicio de la API de Gmail.

        Args:
            account_name (str): El correo electrónico de la cuenta a autenticar.

        Returns:
            googleapiclient.discovery.Resource: Servicio de la API de Gmail autenticado.
        """
        creds = None
        token_file = f'token_{account_name}.pickle'
        if os.path.exists(token_file):
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(self.client_secret_file, SCOPES)
                creds = flow.run_local_server(port=8080)
            with open(token_file, 'wb') as token:
                pickle.dump(creds, token)
        return build('gmail', 'v1', credentials=creds)

    def authenticate_all_accounts(self, accounts):
        """
        Autentica todas las cuentas proporcionadas.

        Args:
            accounts (list): Lista de correos electrónicos que se autenticarán.

        Returns:
            dict: Diccionario de servicios de la API de Gmail autenticados.
        """
        return {account: self.authenticate_account(account) for account in accounts}

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

# Ejemplo de uso:
# if __name__ == "__main__":
#     client_secret_file = 'path/to/client_secret.json'
#     accounts = ["account1@gmail.com", "account2@gmail.com"]

#     gmail_wrapper = GmailWrapper(client_secret_file, accounts)

#     # Enviar un correo desde una cuenta específica
#     response = gmail_wrapper.send_email(
#         from_email="account1@gmail.com",
#         to="recipient@example.com",
#         subject="Test Subject",
#         message_text="This is a test email."
#     )

#     if response:
#         print("Email sent successfully")
#     else:
#         print("Failed to send email")