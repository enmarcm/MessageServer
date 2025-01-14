from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    creds = None
    if os.path.exists('credentials.json'):
        creds = Credentials.from_authorized_user_file('credentials.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                r'C:\Users\theen\Desktop\MAILSERVER\MailSender\src\client_secret.json', SCOPES)
            creds = flow.run_local_server(port=8080)
        with open('credentials.json', 'w') as token:
            token.write(creds.to_json())

if __name__ == '__main__':
    main()
