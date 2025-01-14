import grpc
from concurrent import futures

class GrpcServer:
    def __init__(self, bind_address="127.0.0.1:50051"):
        self.bind_address = bind_address
        self.server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        self.services = []

    def add_service(self, add_servicer_func, servicer):
        self.services.append((add_servicer_func, servicer))

    def add_services(self):
        for add_servicer_func, servicer in self.services:
            add_servicer_func(servicer, self.server)

    def start(self):
        self.add_services()
        self.server.add_insecure_port(self.bind_address)
        return self.server