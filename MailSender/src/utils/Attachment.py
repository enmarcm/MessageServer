import os
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.audio import MIMEAudio
from email.mime.base import MIMEBase
from email import encoders
from mimetypes import guess_type as guess_mime_type

def add_attachment(message, filename, content=None):
    """
    Agrega un archivo adjunto al mensaje de correo electrónico.

    Args:
        message: El mensaje de correo electrónico al que se adjuntará el archivo.
        filename: El nombre del archivo adjunto.
        content: El contenido del archivo en formato binario (opcional).
    """
    content_type, encoding = guess_mime_type(filename)
    if content_type is None or encoding is not None:
        content_type = 'application/octet-stream'
    main_type, sub_type = content_type.split('/', 1)

    if content is None:
        with open(filename, 'rb') as fp:
            content = fp.read()

    if main_type == 'text':
        msg = MIMEText(content.decode(), _subtype=sub_type)
    elif main_type == 'image':
        msg = MIMEImage(content, _subtype=sub_type)
    elif main_type == 'audio':
        msg = MIMEAudio(content, _subtype=sub_type)
    else:
        msg = MIMEBase(main_type, sub_type)
        msg.set_payload(content)
        encoders.encode_base64(msg)

    filename = os.path.basename(filename)
    msg.add_header('Content-Disposition', 'attachment', filename=filename)
    message.attach(msg)