from Google import create_service, convert_to_datetime

#basic setup for using the Google Calendar API
CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'calendar'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Calls the create_service function from Google.py
service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

"""
Creates a calendar on Google Calendar
    calendar_name: the requested name of the calendar
"""
def create_calendar(calendar_name):
    request_body = {
        'summary' : calendar_name
    }
    service.calendars().insert(body=request_body).execute()

"""
Deletes an existing calendar
    calendar_name: the name of the calendar that is to be deleted
"""
def delete_calendar(calendar_name):
    id = get_calendarID(calendar_name)
    if id:
        service.calendars().delete(calendarId=id).execute()
        return True
    else:
        print("Calendar doesn't exist")
        return False

"""
Uses the name of the calendar to locate and return its associated ID
    calendar_name: the name of the calendar
"""
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
    return None

"""
Adds an Event to an existing calendar users can add information like start, end, and an optional description to there event
    Event start and end time must be in this format "2/25/2024 7:00am" or "11/25/2024 11:00pm"

    calendar_name: name of the calendar
    event_name: name of the event
    start_time: the start date and time of the event
    end_time: the end date and time of the event
    description: the optional description of the event
"""
def add_event(calendar_name, event_name, start_time, end_time, description=''):
    calendarId = get_calendarID(calendar_name)
    if calendarId:
        event_request_body = {
            'start' : {
                'dateTime': convert_to_datetime(start_time),
                'timeZone' : 'America/New_York'
            },
            'end' : {
                'dateTime': convert_to_datetime(end_time),
                'timeZone' : 'America/New_York'
            },
            'summary' : event_name,
            'description': description,
            'colorId' : 5,
            'status' : "confirmed",
            "transparency" : "opaque",
            "visibility" : "private",
        }
        maxAttendees = 5
        sendNotifications = False
        sendUpdates = 'none'
        supportsAttachments = False

        service.events().insert(
            calendarId=calendarId,
            maxAttendees=maxAttendees,
            sendUpdates=sendUpdates,
            sendNotifications=sendNotifications,
            supportsAttachments=supportsAttachments,
            body=event_request_body
        ).execute()
        return True
    else:
        print("Calendar doesn't exist")
        return False

"""
Return the ID of the inputed event
    calendar_name: the name of the calendar the event is in
    event_name: the name of the event
"""
def get_event_ID(calendar_name, event_name):
    page_token = None

    calendarID = get_calendarID(calendar_name)
    if calendarID:
        events = service.events().list(calendarId=calendarID, pageToken=page_token).execute()
        for event in events['items']:
            if event_name == event['summary']:
                return event['id']
        return None
    else:
        return None

"""
Deletes an event on an existing calendar
    calendar_name: the name of the calendar the event is in
    event_name: the name of the event that is to be deleted
"""
def delete_event(calendar_name, event_name):
    calendarID = get_calendarID(calendar_name)
    eventID = get_event_ID(calendar_name, event_name)
    if calendarID and eventID:
        service.events().delete(
            calendarId=calendarID,
            eventId=eventID
        ).execute()
        return True
    else:
        print("Either calendar or event doesn't exist")
        return False
