from pprint import pprint
from Google import create_service, convert_to_RFC_datetime

CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'calendar'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/calendar']

service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

def Create_Calendar():
    request_body = {
        'summary' : 'ads Events'
    }
    response = service.calendars().insert(body=request_body).execute()
    return response

def Delete_Calendar(calendar_name):
    id = get_calendarID(calendar_name)
    service.calendars().delete(calendarId=id).execute()


def get_calendarID(calendar_name):
    response = service.calendarList().list(
        maxResults=250,
        showDeleted=False,
        showHidden=False
    ).execute()
    calendarItems = response.get('items')
    for items in calendarItems:
        if calendar_name == items.get('summary'):
            return items.get('id')

def add_event():
    calendarId = get_calendarID("Test Calendar")
    hour_adjustment = -8
    event_request_body = {
        'start' : {
            'dateTime': convert_to_RFC_datetime(2024, 2, 25, 14 + hour_adjustment, 30),
            'timeZone' : 'America/New_York'
        },
        'end' : {
            'dateTime': convert_to_RFC_datetime(2024, 2, 25, 18 + hour_adjustment, 30),
            'timeZone' : 'America/New_York'
        },
        'summary' : 'Family Lunch',
        'description': "having lunch with family",
        'colorId' : 5,
        'status' : "confirmed",
        "transparency" : "opaque",
        "visibility" : "private",
        "location" : "Staten Island, NY",
    }
    maxAttendees = 5
    sendNotifications = False
    sendUpdates = 'none'
    supportsAttachments = False

    response = service.events().insert(
        calendarId=calendarId,
        maxAttendees=maxAttendees,
        sendUpdates=sendUpdates,
        sendNotifications=sendNotifications,
        supportsAttachments=supportsAttachments,
        body=event_request_body
    ).execute()

def get_event_ID(Calendar_Name, Event_Name):
    page_token = None
    while True:
        events = service.events().list(calendarId=get_calendarID(Calendar_Name), pageToken=page_token).execute()
        for event in events['items']:
            if Event_Name == event['summary']:
                return event['id']
            page_token = events.get('nextPageToken')
        if not page_token:
            break

def delete_event(Calendar_Name, Event_Name):
    service.events().delete(
        calendarId=get_calendarID(Calendar_Name),
        eventId=get_event_ID(Calendar_Name, Event_Name)
    ).execute()
