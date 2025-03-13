import grpc
from concurrent import futures

class GrpcServer:
    def __init__(self):
        self.server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    def add_service(self, add_servicer, servicer):
        add_servicer(servicer, self.server)

    def start(self, port=50052):
        self.server.add_insecure_port(f'[::]:{port}')
        self.server.start()
        print(f'Server is running on port {port}...')
        self.server.wait_for_termination()