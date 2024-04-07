import os
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from openai import OpenAI

client = OpenAI(api_key="ENTERYOURKEY")

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
creds = None

if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request()) #need to fix this for now remove .json token in folder and re-init connection
    else:
        flow = InstalledAppFlow.from_client_secrets_file('/Users/berg/Desktop/frontend/backend/client_secret.json', SCOPES)
        creds = flow.run_local_server(port=0)

    with open('token.json', 'w') as token:
        token.write(creds.to_json())

service = build('gmail', 'v1', credentials=creds)

results = service.users().messages().list(userId='me', maxResults=10, q='in:inbox -category:{promotions} -category:{social}').execute()
messages = results.get('messages', [])
#gets 5 most recents emails you can adjust it by changing maxResults ideally 10-20 should be good enough
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
    
    if 'parts' in payload:
        parts = payload['parts']
        body = None
        for part in parts:
            if part['mimeType'] == 'text/plain':
                body = part['body']['data']
                break
        if body:
            body = base64.urlsafe_b64decode(body.encode('UTF-8')).decode('UTF-8')
    else:
        body = payload['body']['data']
        body = base64.urlsafe_b64decode(body.encode('UTF-8')).decode('UTF-8')
    
    # adjust token limit so body of emails to fit within the token limit
    max_tokens = 12000
    body = body[:max_tokens]
    
    prompt = f"Please summarize the following email:\n\nSubject: {subject}\nFrom: {sender}\n\n{body}"
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.7
    )
    summary = response.choices[0].message.content.strip()
    
    print(f"Subject: {subject}")
    print(f"From: {sender}")
    print(f"Summary: {summary}\n")
