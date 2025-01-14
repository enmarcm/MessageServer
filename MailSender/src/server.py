from utils.GrpcServer import GrpcServer
from protos import mail_pb2_grpc
from protos import data_pb2_grpc
from services.MailService import MailService
from services.DataService import DataService

def serve():
    server = GrpcServer()
    server.add_service(mail_pb2_grpc.add_MailServiceServicer_to_server, MailService(
        client_secret_file='./client_secret.json',
        credentials_file='path/to/credentials.json'
    ))
    server.add_service(data_pb2_grpc.add_DataServiceServicer_to_server, DataService())
    grpc_server = server.start()
    grpc_server.start()
    print("Server is running on port 50051...")
    grpc_server.wait_for_termination()

if __name__ == '__main__':
    serve()