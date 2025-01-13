from concurrent import futures
import grpc
from protos import mail_pb2_grpc
from services.MailService import MailService

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    mail_pb2_grpc.add_MailServiceServicer_to_server(MailService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server is running on port 50051...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()