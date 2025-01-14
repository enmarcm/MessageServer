from protos import mail_pb2_grpc
from protos import mail_pb2

class MailService(mail_pb2_grpc.MailServiceServicer):
    def SendMail(self, request, context):
        print(f"Received mail request: {request.email}, {request.subject}, {request.body}")
        # Aquí puedes agregar la lógica para enviar el correo
        return mail_pb2.MailResponse(status=f"Mail sent successfully to {request.email}" )
    
    
