import os
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from openai import OpenAI
from googleapiclient.errors import HttpError
from email.message import EmailMessage
from google.auth.transport.requests import Request

client = OpenAI(api_key="ENTERYOURKEY")
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send']

"""
Used to create and authenticate a servicee for a Google API using OAuth 2.0 from the Google Cloud Console
very similar to google calender auth but it focus on GMAIL.
"""

def get_email_summaries(search_query=''):
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('/Users/berg/Desktop/frontend/backend/client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)
    results = service.users().messages().list(userId='me', maxResults=5, q='in:inbox -category:{promotions} -category:{social}').execute()
    messages = results.get('messages', [])

    email_summaries = []
"""
Pulls recent emails and parse to OEPNAI to summarize. Adjust token limit (set to 12000) to more emails or incomplete summarizes/blanks responses.
We have it set by maxResults to 5 recent emails in primary inbox but can be adjust to promotions, social inboxes.
"""
    for message in messages:
        msg = service.users().messages().get(userId='me', id=message['id']).execute()
        payload = msg['payload']
        headers = payload['headers']
        subject = ''
        sender = ''
        for header in headers:
            if header['name'] == 'Subject':
                subject = header['value']
            if header['name'] == 'From':
                sender = header['value']

        body = ''
        attachments = []
        if 'parts' in payload:
            parts = payload['parts']
            for part in parts:
                if part['mimeType'] == 'text/plain':
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('UTF-8')
                elif part['mimeType'].startswith('image/'):
                    attachment = {
                        'id': part['body']['attachmentId'],
                        'filename': part['filename'],
                        'mimeType': part['mimeType']
                    }
                    attachments.append(attachment)
        else:
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('UTF-8')

        
        max_tokens = 12000
        body = body[:max_tokens]

        prompt = f"Please provide a easy to read summary for the following email. Include any times, events, dates, meetings, links, or other important info.\n\nSubject: {subject}\nFrom: {sender}\n\n{body}"
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250,
            n=1,
            stop=None,
            temperature=0.7
        )
        summary = response.choices[0].message.content.strip()
"""
Mark email based on priority red circle and blue for less urgent emails
"""
        priority = 'low'
        keywords = ['meeting', 'deadline', 'urgent', 'important', 'order', 'school', 'money', 'zoom', 'payment', 'job']
        if any(keyword in subject.lower() or keyword in body.lower() for keyword in keywords):
            priority = 'high'

        email_summaries.append({
            'id': message['id'],
            'subject': subject,
            'sender': sender,
            'summary': summary,
            'body': body,
            'attachments': attachments,
            'priority': priority
        })

    filtered_email_summaries = []
    for email in email_summaries:
        if search_query.lower() in email['body'].lower():
            filtered_email_summaries.append(email)

    return filtered_email_summaries

"""
Used to send emails directly from frontend using your email. This works 50/50 needs to be adjusted/better auth handling. 
    
"""

def send_email_response(email_id, response):
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('/Users/berg/Desktop/frontend/backend/client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)

    try:
        message = service.users().messages().get(userId='me', id=email_id, format='full').execute()

        subject = None
        for header in message['payload']['headers']:
            if header['name'].lower() == 'subject':
                subject = header['value']
                break

        if subject:
            reply_subject = f"Re: {subject}"
        else:
            reply_subject = "Re: Your Email"

        reply_msg = EmailMessage()
        reply_msg['To'] = message['payload']['headers'][16]['value']
        reply_msg['Subject'] = reply_subject
        reply_msg.set_content(response)

        encoded_reply = base64.urlsafe_b64encode(reply_msg.as_bytes()).decode()

        send_reply = {
            'raw': encoded_reply,
            'threadId': message['threadId']
        }
        service.users().messages().send(userId='me', body=send_reply).execute()
    except HttpError as error:
        print(f"An error occurred: {error}")
