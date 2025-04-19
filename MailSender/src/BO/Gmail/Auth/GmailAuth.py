from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import pickle

def authenticate_account(account_name, client_secret_file, scopes):
    """
    Autentica una cuenta de Gmail y devuelve el servicio de la API de Gmail.

    Args:
        account_name (str): El correo electrónico de la cuenta a autenticar.
        client_secret_file (str): Ruta al archivo client_secret.json para la cuenta.
        scopes (list): Lista de alcances necesarios para la autenticación.

    Returns:
        googleapiclient.discovery.Resource: Servicio de la API de Gmail autenticado.
    """
    creds = None
    token_file = f'token_{account_name}.pickle'

    # Cargar credenciales desde el archivo token si existe
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)

    # Si no hay credenciales válidas, iniciar el flujo de autenticación
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(client_secret_file, scopes)
            creds = flow.run_local_server(port=8080)
        # Guardar las credenciales en un archivo token
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)

    # Construir y devolver el servicio autenticado de Gmail
    return build('gmail', 'v1', credentials=creds)