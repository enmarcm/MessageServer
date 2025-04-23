from protos import mail_pb2_grpc
from protos import mail_pb2
from BO.MailSender.MailSender import MailSender

class MailService(mail_pb2_grpc.MailServiceServicer):
    def __init__(self, client_secrets):
        self.MailSender = MailSender(client_secrets)

    def SendMail(self, request, context):
        from_value = getattr(request, 'from')  
        print(f"Sending mail from {from_value} to {request.to} with subject '{request.subject}'")

        # Procesar los archivos adjuntos
        attachments = [
            {"filename": attachment.filename, "content": attachment.content}
            for attachment in request.attachments
        ]

        response = self.MailSender.send_message(
            from_email=from_value,
            destination=request.to,
            obj=request.subject,
            body=request.body,
            attachments=attachments
        )
        
        if response:
            return mail_pb2.MailResponse(status=f"Mail sent successfully to {request.to}")
        else:
            return mail_pb2.MailResponse(status="Failed to send mail")
      
    def CheckBounceStatus(self, request, context):
        result = self.MailSender.gmail_wrapper.check_bounce_status(
            from_email=getattr(request, 'from'),
            to=getattr(request, 'to'),
            sent_time=request.sent_time
        )
        return mail_pb2.BounceResponse(status=result["status"], reason=result["reason"])