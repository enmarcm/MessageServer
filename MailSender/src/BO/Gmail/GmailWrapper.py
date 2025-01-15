import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from oauth2client.file import Storage
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.tools import run_flow

class GmailWrapper:
    def __init__(self, client_secret_file, credentials_file):
        self.client_secret_file = client_secret_file
        self.credentials_file = credentials_file
        self.services = self.authenticate_all_gmails()

    def authenticate_all_gmails(self):
        # Set up the OAuth 2.0 flow
        flow = OAuth2WebServerFlow(
            client_id='YOUR_CLIENT_ID',
            client_secret='YOUR_CLIENT_SECRET',
            scope='https://www.googleapis.com/auth/gmail.send',
            redirect_uri='urn:ietf:wg:oauth:2.0:oob'
        )

        storage = Storage(self.credentials_file)
        credentials = storage.get()

        if not credentials or credentials.invalid:
            credentials = run_flow(flow, storage)

        service = build('gmail', 'v1', credentials=credentials)
        return service

    def send_email(self, from_email, to, subject, message_text):
        if from_email not in self.services:
            print(f'No credentials found for {from_email}')
            return None

        service = self.services[from_email]
        message = MIMEText(message_text)
        message['to'] = to
        message['from'] = from_email
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

        message = {
            'raw': raw
        }

        try:
            message = (service.users().messages().send(userId="me", body=message).execute())
            print(f'Message Id: {message["id"]}')
            return message
        except Exception as error:
            print(f'An error occurred: {error}')
            return None