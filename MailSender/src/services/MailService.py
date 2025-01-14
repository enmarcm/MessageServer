from protos import mail_pb2_grpc
from protos import mail_pb2
from utils.GmailWrapper import GmailWrapper

class MailService(mail_pb2_grpc.MailServiceServicer):
    def __init__(self, client_secret_file, credentials_file):
        self.gmail_wrapper = GmailWrapper(client_secret_file, credentials_file)

    def SendMail(self, request, context):
        response = self.gmail_wrapper.send_email(
            from_email=request.from_email,
            to=request.to_email,
            subject=request.subject,
            message_text=request.body
        )
        if response:
            return mail_pb2.MailResponse(status=f"Mail sent successfully to {request.to_email}")
        else:
            return mail_pb2.MailResponse(status="Failed to send mail")
