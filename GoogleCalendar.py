"""
Developed by: Leonardo Gonzalez Luzon
"""


from Google import convert_to_datetime
from speech_to_text import text_to_speech, speech_to_text
from datetime import datetime
import pytz
"""
Creates a calendar on Google Calendar
    calendar_name: the requested name of the calendar
    service: a service instance to utillize the Google API
"""
def create_calendar(calendar_name, service):
    request_body = {
        'summary' : calendar_name
    }
    service.calendars().insert(body=request_body).execute()
    str = "\n" + "Calendar called " + calendar_name + " has been created." + "\n"
    return str

"""
Deletes an existing calendar
    calendar_name: the name of the calendar that is to be deleted
    service: a service instance to utillize the Google API
"""
def delete_calendar(calendar_name, service):
    id = get_calendarID(calendar_name, service)
    if id:
        service.calendars().delete(calendarId=id).execute()
        str = "\n" + "Calendar called " + calendar_name + " was deleted." + "\n"
    else:
        str = "\n" + "Calendar doesn't exist" + "\n"
    return str

"""
Uses the name of the calendar to locate and return its associated ID
    calendar_name: the name of the calendar
    service: a service instance to utillize the Google API
"""
def get_calendarID(calendar_name, service):
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
Creates an Event to an existing calendar users can add information like start, end, and an optional description to there event
    Event start and end time must be in this format "2/25/2024 7:00am" or "11/25/2024 11:00pm"

    calendar_name: name of the calendar
    event_name: name of the event
    start_time: the start date and time of the event
    end_time: the end date and time of the event
    service: a service instance to utillize the Google API
    description: the optional description of the event
"""
def create_event(calendar_name, event_name, start_time, end_time, service, description=''):
    calendarId = get_calendarID(calendar_name, service)
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
        str = "\n" + "Created Event " + event_name + " on " + calendar_name + " from " + start_time + " to " + end_time + "\n"
    else:
        str = "\n" + "Calendar doesn't exist" + "\n"
    return str

"""
Return the ID of the inputed event
    calendar_name: the name of the calendar the event is in
    event_name: the name of the event
    service: a service instance to utillize the Google API
"""
def get_event_ID(calendar_name, event_name, service):
    page_token = None

    calendarID = get_calendarID(calendar_name, service)
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
    service: a service instance to utillize the Google API
"""
def delete_event(calendar_name, event_name, service):
    calendarID = get_calendarID(calendar_name, service)
    eventID = get_event_ID(calendar_name, event_name, service)
    if calendarID and eventID:
        service.events().delete(
            calendarId=calendarID,
            eventId=eventID
        ).execute()
        str = "\n" + "The event called " + event_name + " was deleted" + "\n"
    else:
        str = "\n" + "Either calendar or event doesn't exist" + "\n"
    return str

"""
returns a list of calendars that are listed on the users google calendar
"""
def list_calendars(service):
    calendars = service.calendarList().list().execute()
    calendar_names = [{'id': cal['id'], 'summary': cal['summary']} for cal in calendars['items']]
    return calendar_names

"""
goes through the desired calendar and pulls all of the events in order of date and returns a 
list conataing relavent information like the id title and start and end times then returns the first 5
"""
def fetch_events(calendar_id, service, max_results=5):
    # Set the timeMin to the current time in UTC
    now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    try:
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        # sets time zone to eastern time
        eastern = pytz.timezone('America/New_York')
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            start_dt = datetime.strptime(start, "%Y-%m-%dT%H:%M:%S%z").astimezone(eastern)
            end_dt = datetime.strptime(end, "%Y-%m-%dT%H:%M:%S%z").astimezone(eastern)
            formatted_events.append({
                'id': event['id'],
                'title': event.get('summary', 'No Title'),
                'start': start_dt.strftime("%Y-%m-%dT%H:%M:%S%z"),
                'end': end_dt.strftime("%Y-%m-%dT%H:%M:%S%z"),
                'date': start_dt.strftime("%m/%d"),
                'time': f"{start_dt.strftime('%I:%M %p')} - {end_dt.strftime('%I:%M %p')}"
            })
        return formatted_events
    except Exception as e:
        print(f"Failed to fetch events: {e}")
        return []