import json
import os
from utils.GrpcServer import GrpcServer
from protos import mail_pb2_grpc
from protos import data_pb2_grpc
from services.MailService import MailService
from services.DataService import DataService

def load_credentials(credentials_path):
    """
    Carga el contenido del archivo JSON de credenciales.

    Args:
        credentials_path (str): Ruta al archivo de credenciales.

    Returns:
        dict: Contenido del archivo JSON de credenciales.
    """
    try:
        with open(credentials_path, 'r') as file:
            credentials_content = json.load(file)
            return credentials_content
    except FileNotFoundError:
        print(f"El archivo {credentials_path} no se encontró.")
        return None
    except json.JSONDecodeError:
        print(f"El archivo {credentials_path} no es un JSON válido.")
        return None

def get_client_secret(credentials_content):
    """
    Obtiene el client_secret del contenido de las credenciales.

    Args:
        credentials_content (dict): Contenido del archivo JSON de credenciales.

    Returns:
        str: El client_secret.
    """
    installed = credentials_content.get('installed', {})
    return installed.get('client_secret')

def create_grpc_server(client_secrets):
    """
    Crea y configura el servidor gRPC.

    Args:
        client_secrets (dict): Diccionario de secretos del cliente para el servicio de correo.

    Returns:
        GrpcServer: El servidor gRPC configurado.
    """
    server = GrpcServer()
    server.add_service(mail_pb2_grpc.add_MailServiceServicer_to_server, MailService(client_secrets))
    server.add_service(data_pb2_grpc.add_DataServiceServicer_to_server, DataService())
    return server
def serve():
    """
    Inicia el servidor gRPC.
    """
    credentials_path = os.path.join(os.path.dirname(__file__), 'BO', 'Gmail', 'Auth', 'credentials.json')
    credentials_content = load_credentials(credentials_path)
    
    if credentials_content:
        client_secrets = {
            "theenmanuel123@gmail.com": credentials_path,
        }
        grpc_server = create_grpc_server(client_secrets).start()
        grpc_server.start()
        print("Server is running on port 50051...")
        grpc_server.wait_for_termination()
    else:
        print("No se pudo cargar el archivo de credenciales. El servidor no se iniciará.")


if __name__ == '__main__':
    serve()