from src.protos import sms_pb2_grpc, sms_pb2

class SMSService(sms_pb2_grpc.SMSServiceServicer):
    def __init__(self, sms_sender):
        self.sms_sender = sms_sender

    def SendSMS(self, request, context):
        success, error = self.sms_sender.send_sms(request.to, request.message)
        return sms_pb2.SMSResponse(success=success, error=error)