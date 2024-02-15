import os
from openai import OpenAI
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import datetime
import constants

# copy your openai secret key to api_key
client = OpenAI(api_key = constants.APIKEY)
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
CALENDAR_ID = '95b4bfbb1b3c0cf4e23dd44da098a6bab74dd54f04cce2520abe32dcb9988436@group.calendar.google.com'

def get_credentials():
    creds = None
    token_file = 'token.json'
    
    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config(
                client_config={
                    "web": {
                        "client_id": "995726904455-kd2ft87q1h8ursolcpg3uv7vtcjio8be.apps.googleusercontent.com",
                        "project_id": "articulate-run-414219",
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "client_secret": "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",
                        "redirect_uri": ["http://localhost:55388/"],
                    }
                },
                scopes=['https://www.googleapis.com/auth/calendar.events'],
            )
            creds = flow.run_local_server(port=0)
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
    return creds

# Google Calendar API functions
def add_event_to_google_calendar(event_name, event_date):
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    
    event = {
        'summary': event_name,
        'start': {'dateTime': event_date.isoformat(), 'timeZone': 'your-timezone'},
        'end': {'dateTime': (event_date + datetime.timedelta(hours=1)).isoformat(), 'timeZone': 'your-timezone'},
    }

    service.events().insert(calendarId=CALENDAR_ID, body=event).execute()

def remove_event_from_google_calendar(event_id):
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)

    service.events().delete(calendarId=CALENDAR_ID, eventId=event_id).execute()



# api will recieve these messages to make a response
message_log = []

# will allow users to keep asking multiple messages
while input != "quit()":
    # take an input so the user can ask a question
    message = input()


    if message.startswith("add event"):
        _, event_name, event_date_str = message.split(" ", 2)
        event_date = datetime.datetime.strptime(event_date_str, "%Y-%m-%d").date()
        add_event_to_google_calendar(event_name, event_date)
        print(f"Event '{event_name}' added to Google Calendar.")
    elif message.startswith("remove event"):
        _, event_id = message.split(" ", 1)
        remove_event_from_google_calendar(event_id)
        print(f"Event '{event_id}' removed from Google Calendar.")



    # append the message to the list
    message_log.append({"role": "user", "content": message})
    # connect to the api in order for the api to bring back a response
    chat_completion = client.chat.completions.create(
        messages=message_log,
        model="gpt-3.5-turbo"
    )
    # the answer to the prompted question
    reply = chat_completion.choices[0].message.content
    # appends the message to the list so that the chatbot remembers the chat history
    message_log.append({"role": "assistant", "content": reply})
    # prints the response
    print("\n" + reply + "\n")