import grpc
from concurrent import futures
from protos import example_pb2_grpc
from services.MailService import MailService

class GrpcServer:
    def __init__(self, bind_address="127.0.0.1:50051"):
        self.bind_address = bind_address
        self.server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    def add_services(self):
        example_pb2_grpc.add_MailServiceServicer_to_server(MailService(), self.server)

    def start(self):
        self.add_services()
        self.server.add_insecure_port(self.bind_address)
        print(f"Server is running on port {self.bind_address}")
        self.server.start()
        self.server.wait_for_termination()

# Example usage
if __name__ == "__main__":
    server = GrpcServer()
    server.start()