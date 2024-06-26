"""
Developed by: Leonardo Gonzalez Luzon
"""

from openai import OpenAI
import constants
from Google import convert_to_datetime
from speech_to_text import text_to_speech, speech_to_text
from datetime import datetime
import pytz
from pytz import timezone
from googleapiclient.errors import HttpError
from dateutil.parser import parse
from datetime import datetime, timedelta


client = OpenAI(api_key = constants.APIKEY)

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
            if event_name == event.get('summary', ''):
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
def fetch_events(calendar_id, service, max_results):
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
        eastern = pytz.timezone('America/New_York')
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            if 'T' in start:
                start_dt = datetime.strptime(start, "%Y-%m-%dT%H:%M:%S%z").astimezone(eastern)
                end_dt = datetime.strptime(end, "%Y-%m-%dT%H:%M:%S%z").astimezone(eastern)
                time_str = f"{start_dt.strftime('%I:%M %p')} - {end_dt.strftime('%I:%M %p')}"
            else:
                start_dt = datetime.strptime(start, "%Y-%m-%d").date()
                end_dt = datetime.strptime(end, "%Y-%m-%d").date()
                time_str = "All Day"
            formatted_events.append({
                'id': event['id'],
                'title': event.get('summary', 'No Title'),
                'start': start_dt.strftime("%Y-%m-%dT%H:%M:%S%z") if isinstance(start_dt, datetime) else start_dt.strftime("%Y-%m-%d"),
                'end': end_dt.strftime("%Y-%m-%dT%H:%M:%S%z") if isinstance(end_dt, datetime) else end_dt.strftime("%Y-%m-%d"),
                'date': start_dt.strftime("%m/%d") if isinstance(start_dt, datetime) else start_dt.strftime("%m/%d"),
                'time': time_str
            })
        return formatted_events
    except Exception as e:
        print(f"Failed to fetch events: {e}")
        return []
"""
takes a string that contains a date and coverts it into the format that is used by the google calendar api
"""
def convert_time_format(str):
    dt = datetime.strptime(str, '%Y-%m-%dT%H:%M:%S%z')
    return dt.strftime('%m/%d/%Y %I:%M%p').lower()

"""
takes an users input and returns the changes that the user wants to make to their event. If a user doesn't wish to change a certain part of their event the function will return
None to indicate no change
"""
def edit_event_helper(calendar_name, user_input, service):
    first_events = fetch_events(get_calendarID(calendar_name, service), service, 10000)
    # this puts all of the users events on their calednar into a list that allows the ai to figure out which event needs to be changed and the start and end time changes that are needed
    events = [{'title': first_event['title'], 'start': convert_time_format(first_event['start']), 'end': convert_time_format(first_event['end'])} for first_event in first_events]
    classifier = """
    You will recieve a list containing events in a users calendar. 
    Each event in the list will contain 3 pieces of information pertaining to each event and those are the title, the start time, and the end time.
    Note the start and end time is a date plus a time.
    You will also recieve a input from the user with a request to change certain things on their event they could ask to change the name of the event, the start time, or the end time.
    The user can ask to change up to all 3 pieces of information on the specified event
    You will respond my giving the new information seperated by a comma, if a piece of information is not changed you will put None in its place.
    If a user asks for a new start time but doesn't include a new date just assume its on the same day
    NOTE: If the user asks for a new start time that is after the current end time of their event and they don't give a new end time, just push the end time back based on the current event duration
    Example: if the user's event starts at 4/2/2024 11:00am and ends at 4/2/2024 1:00pm and they say they want to change the start time to 2pm and doesnt give a end time you would return: None, 4/2/2024 2:00pm, 4/2/2024 4:00pm 
    Make sure to respond with the changes for the correct calendar. If the user wants changes to their lunch event make sure to look at the event list to get the inforamtion connected to the event called lunch and not the information of another event
    These are a few more examples of how you should respond 
 

    Question: can you change my lunch event on my school calendar to start at 12pm
    [{'title': 'lunch',
      'start': '04/02/2024 11:00am',
      'end': '04/02/2024 11:45am'},
    {'title': 'dinner',
     'start': '04/02/2024 06:00pm',
     'end': '04/02/2024 08:00pm'}]
    Response: None, 04/02/2024 12:00pm, 04/02/2024 12:45pm
    
    Question: can you change lunch to start at 11am
    [{'title': 'lunch',
      'start': '04/02/2024 10:45am',
      'end': '04/02/2024 11:45am'},
    {'title': 'dinner',
     'start': '04/02/2024 06:00pm',
     'end': '04/02/2024 08:00pm'}]
    Response: None, 04/02/2024 11:00am, None

    Question: can you change lunch to breakfast
    [{'title': 'lunch',
      'start': '04/02/2024 10:45am',
      'end': '04/02/2024 11:45am'},
    {'title': 'dinner',
     'start': '04/02/2024 06:00pm',
     'end': '04/02/2024 08:00pm'}]    
    Response: breakfast, None, None

    Question: can you change push my event called breakfast back 2 hours and call it lunch
    [{'title': 'breakfast',
      'start': '04/02/2024 10:45am',
      'end': '04/02/2024 11:45am'},
    {'title': 'dinner',
     'start': '04/02/2024 06:00pm',
     'end': '04/02/2024 08:00pm'}] 
    Response: lunch, 04/02/2024 12:45pm, 04/02/2024 1:45pm
    """
    message_log = [{'role' : "system", "content" : classifier}]
    events_str = ', '.join([f"{event['title']} (Start: {event['start']}, End: {event['end']})" for event in events])
    message = f"These are my events: {events_str}. And this is my request: {user_input}"
    message_log.append({"role": "user", "content": message})
    chat_completion = client.chat.completions.create(
        messages=message_log,
        model="gpt-3.5-turbo"
    )
    reply = chat_completion.choices[0].message.content
    # splits the changes into 3 seperate entities and returns
    info = reply.split(", ")
    for i in range(3):
        if info[i] == "None":
            info[i] = None
    return info[0], info[1], info[2]


"""
This is the edit event function that is used for the chatbot to edit events based on the users message
    calendar_name: the name of the calednar that the event is on
    event_name: the name of the event that the user wants changed
    user_input: the users message that contains the areas of the event the user wants changed
    service: a service instance to utillize the Google API
"""
def edit_event(calendar_name, event_name, user_input, service):
    new_event_name, new_start_time, new_end_time = edit_event_helper(calendar_name, user_input, service)
    calendarID = get_calendarID(calendar_name, service)
    eventID = get_event_ID(calendar_name, event_name, service)
    if calendarID and eventID:
        event = service.events().get(calendarId=calendarID, eventId=eventID).execute()
        if new_event_name:
            event['summary'] = new_event_name
        if new_start_time:
            event['start'] = {
                'dateTime': convert_to_datetime(new_start_time),
                'timeZone': 'America/New_York',
            }
        if new_end_time:
            event['end'] = {
                'dateTime': convert_to_datetime(new_end_time),
                'timeZone': 'America/New_York',
            }
        service.events().update(calendarId=calendarID, eventId=eventID, body=event).execute()
        str = "\n" + "Event updated successfully." + "\n"
        return str
    else:
        str = "\n" + "Either the calendar or the event doesn't exist." + "\n"
        return str

"""
This is the edit event function that is used for the front end on the calendar view widget
"""
def edit_event_front(calendar_id, event_id, new_title, new_start, new_end, service):
    try:
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()

        if new_title:
            event['summary'] = new_title
        if new_start:
            event['start'] = {'dateTime': new_start, 'timeZone': 'America/New_York'}
        if new_end:
            event['end'] = {'dateTime': new_end, 'timeZone': 'America/New_York'}

        updated_event = service.events().update(calendarId=calendar_id, eventId=event_id, body=event).execute()
        return True
    except HttpError as error:
        print(f'An error occurred: {error}')
        return False

"""
checks to see if there is any overlap when an event is added and adjusts the events so that there is no overlap
    calendar_id: the calendars id
    new_event: the information of the new event(ie: name, start time, end time)
    existing_events: a list of the events on the users calendar that contains the information of each event
    service: a service instance to utillize the Google API
"""    
def adjust_events(calendar_id, new_event, existing_events, service):
    eastern = pytz.timezone('America/New_York')  # Define the timezone

    def safe_localize(dt):
        # Function to safely localize datetime if it's naive
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            return eastern.localize(dt)
        return dt

    def is_outside_operational_hours(dt):
        # Checks if the time is outside operational hours (before 8 AM or after 10 PM)
        return dt.hour >= 22 or dt.hour < 8

    # Localize the new event times
    new_event_start = safe_localize(parse(new_event['start']))
    new_event_end = safe_localize(parse(new_event['end']))
    existing_events.sort(key=lambda x: safe_localize(parse(x['start'])))

    events_updated = False  # Flag to indicate if any events were shifted to the next day

    for i, event in enumerate(existing_events):
        event_start = safe_localize(parse(event['start']))
        event_end = safe_localize(parse(event['end']))
        event_id = event['id']

        # Check if there is an overlap
        if max(new_event_start, event_start) < min(new_event_end, event_end):
            duration = event_end - event_start
            adjusted_start = new_event_end

            # Determine if adjustment needs to push the event to the next day
            if is_outside_operational_hours(adjusted_start):
                next_day = adjusted_start.date() + timedelta(days=1)
                # Adjust start time to 8:00 AM, and subtract 56 minutes
                adjusted_start = datetime(next_day.year, next_day.month, next_day.day, 8, 0, 0, tzinfo=eastern) - timedelta(minutes=56)
                events_updated = True  # Mark that we have pushed an event to the next day

            adjusted_end = adjusted_start + duration

            updated_event = {
                'summary': event['title'],
                'start': {'dateTime': adjusted_start.isoformat(), 'timeZone': 'America/New_York'},
                'end': {'dateTime': adjusted_end.isoformat(), 'timeZone': 'America/New_York'},
                'description': event.get('description', ''),
                'status': 'confirmed',
                'colorId': event.get('colorId', '1'),
                'transparency': 'opaque',
                'visibility': 'private',
            }
            try:
                service.events().update(calendarId=calendar_id, eventId=event_id, body=updated_event).execute()
            except Exception as error:
                print(f"Failed to update event: {error}")
                continue

            # After adjusting one event to the next day, check if further adjustments are needed
            if events_updated:
                break  # Exit the loop early if we've already moved events to the next day

    return True

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
def create_event_front(calendarId, event_name, start_time, end_time, service, description=''):
    existing_events = fetch_events(calendarId, service, 10000)
    new_event = {
        'title': event_name,
        'start': start_time,
        'end': end_time,
        'description': description
    }
    adjust_events(calendarId, new_event, existing_events, service)
    event_request_body = {
        'start' : {
            'dateTime': start_time,
            'timeZone' : 'America/New_York'
        },
        'end' : {
            'dateTime': end_time,
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

"""
recieves user input and relays information to the user based off their request
    calendar_name: the name of the calendar
    user_input: the users request
    service: a service instance to utillize the Google API
"""
def calendar_information(calendar_name, user_input, service):
    print(calendar_name)
    first_events = fetch_events(get_calendarID(calendar_name, service), service, 10000)
    # this puts all of the users events on their calednar into a list that allows the ai to figure out which event needs to be changed and the start and end time changes that are needed
    events = [{'title': first_event['title'], 'start': convert_time_format(first_event['start']), 'end': convert_time_format(first_event['end'])} for first_event in first_events]
    # gets the real time so that the chatbot can make more accurate responses
    current_datetime = datetime.now()
    formatted_date = current_datetime.strftime('%B %d, %Y %I:%M%p').lower()
    print(formatted_date)
    classifier = """
    You will recieve a list containing events in a users calendar and the current date.
    Each event in the list will contain 3 pieces of information pertaining to each event and those are the title, the start time, and the end time.
    Note the start and end time is a date plus a time.
    You will also recieve a message from the user asking you a question about the events on their calendar.
    Using the information you have answer their request to the best of your ability.
    For example, if the user asks whats their next upcoming event you would tell them the next event on their calendar,
    if they ask you to see what time a certain event starts you would look through the events to find the relevent information to relay to the user
    MAKE SURE THAT YOU REMEMBER THE TIME THAT IS GIVEN TO YOU
    """
    message_log = [{'role' : "system", "content" : classifier}]
    events_str = ', '.join([f"{event['title']} (Start: {event['start']}, End: {event['end']})" for event in events])
    message = f"Today is {formatted_date}. These are my events: {events_str}. And this is my request: {user_input}"
    message_log.append({"role": "user", "content": message})
    chat_completion = client.chat.completions.create(
        messages=message_log,
        model="gpt-3.5-turbo"
    )
    reply = chat_completion.choices[0].message.content
    return reply