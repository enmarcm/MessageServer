from protos import mail_pb2_grpc
from protos import mail_pb2
from BO.MailSender.MailSender import MailSender

class MailService(mail_pb2_grpc.MailServiceServicer):
    def __init__(self, client_secrets):
        self.MailSender = MailSender(client_secrets)

    def SendMail(self, request, context):
        from_value = getattr(request, 'from')  
        response = self.MailSender.send_message(
            from_email=from_value,
            destination=request.to,
            obj=request.subject,
            body=request.body
        )
        
        if response:
            return mail_pb2.MailResponse(status=f"Mail sent successfully to {request.to}")
        else:
            return mail_pb2.MailResponse(status="Failed to send mail")