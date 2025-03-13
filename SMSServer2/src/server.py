import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.GrpcServer import GrpcServer
from protos import sms_pb2_grpc, data_pb2_grpc
from services.SMSService import SMSService
from services.DataService import DataService
from BO.SMSSender.SMSSender import SMSSender

def serve():
    sms_sender = SMSSender(port='COM9')

    server = GrpcServer()
    server.add_service(sms_pb2_grpc.add_SMSServiceServicer_to_server, SMSService(sms_sender))
    server.add_service(data_pb2_grpc.add_DataServiceServicer_to_server, DataService())
    server.start()

if __name__ == '__main__':
    serve()