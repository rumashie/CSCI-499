"""
Developed by: Leonardo Gonzalez Luzon
"""


from openai import OpenAI
import constants
from GoogleCalendar import create_calendar, delete_calendar, create_event, delete_event, edit_event, calendar_information
from Google import create_service
from Spotify import get_token, play_song, create_playlist
from speech_to_text import speech_to_text, text_to_speech


# copy your openai secret key to api_key
client = OpenAI(api_key = constants.APIKEY)
#basic setup for using the Google Calendar API
CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'calendar'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/calendar']
# Calls the create_service function from Google.py
service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)


"""
sets up the chatbot for instances where users want to do some type of action
"""
def init_messages(message_log):
    """
    this classifier allows the chat bot to determine if the user is asking a general question 
    to which it will respond with an answer or if the user is trying to something to their calendar
    in that case responds with a list containing information related to the function that will be called
    """
    classifier = """You are a chatbot assistant that helps people with their daily tasks. I want for you to respond to questions depending on what you think they are the type of question they are.
    The possible types of questions are:
    - A general question, that can be answered by the chatbot
    - A request to do something with their calendar
    - A request for information about certain events on their calendar
    - A request for a song that can be played on Spotify
    - A request for the weather or forecast
    If you think the question is a general question that can be answered over the internet, then answer their question. 
    If you think the question is a request to do something to their calendar, then give me a phase that corrisponds to the action they want to do.
    Then give me the attributes needed to perform each task from the user input. 
    The attributes I need for each task goes as followed:
    Create calendar: calendar_name
    Delete calendar: calendar_name
    Create event: calendar_name, event_name, start_time, end_time, and an optional description (NOTE: start_time and end_time must contain a date and be in this format 2/25/2024 7:00am)
    Delete event: calendar_name, event_name
    Edit event: calendar_name, event_name

    IF ANY ATTRIBUTE IS MISSING PLEASE ASK THE USER FOR THE MISSING ATTRIBUTE UNLESS ITS OPTIONAL!
    IF THEY DON'T SPECIFY A DATE ASK THEM FOR THAT!
    MAKE SURE START AND END TIMES ARE IN THIS FORMAT 2/25/2024 7:00am NOTHING SHOULD BE LEFT OUT, YOU NEED MONTH, DAY, YEAR, AND TIME!
    MAKE SURE THAT FOR EDIT EVENT YOU GIVE ONLY THE FUNCTION NAME, THE CALENDAR NAME, AND THE EVENT NAME. IF THE CALENDAR NAME OR EVENT NAME IS MISSING JUST SAY "I cannot process your response right now if you want to edit an event please tell me the name of your event and calendar" DONT ASK FOR MISSING INFORMATION

    Examples: 

    Question: can you create an event on my school calendar called lunch at 12pm for 2 hours
    Response: What is the date of the event you want to create?

    Question: Create a calendar called test calendar
    Response: Create calendar, test calendar

    Question: Create an event called lunch at feb 25 2024 at 2pm for 2 hours on my test calendar
    Response: Create event, test, lunch, 2/25/2024 2:00pm, 2/25/2024 4:00pm

    Question: Create an event called breakfast with friends at feb 25 2024 at 11pm for 4 hours on my test calendar with the description of lunch with my friends from school
    Response: Create event, test, breakfast with friends, 2/25/2024 11:00am, 2/25/2024 3:00pm, lunch with my friends from school

    Question: Create an event called breakfast with friends at feb 25 2024 at 11pm for 4 hours with the description of lunch with my friends from school
    Response: What calendar do you want to add it to?

    Question: Create an event called breakfast with friends at 11pm for 4 hours on my test calendar with the description of lunch with my friends from school
    Response: What is the date of the event you want to create?

    Question: Delete test calendar for me
    Response: Delete calendar, test calendar

    Question: Delete lunch with friends on my test calendar
    Response: Delete event, lunch with friends, test calendar

    Question: can you change my event called lunch on my college calendar to start at 1pm instead of 2pm
    Response: Edit event, college, lunch

    Question: can you change my event called study on my college calendar to be called hang out with friends
    Response: Edit event, college, study

    If you think the user is trying to recieve information about certain events on their calendar whether it be whens their next event, what events they have on certain days,
    what do I have to do tomorrow, etc, just respond as follows
    Calendar_Information, calendar_name
    If the user doesn't give a calendar name then ask for it
    Remember if the user says something like "on my school calendar" or "on my calendar called school" the calendar_name would be "school" not "school calendar"

    If you think the question is a request to do something that has to do with music or something that can be accomplished with the SpotifyAPI, then give me a phrase
    that corrisponds to the action they want to do. Then give me the attributes needed to perform each task from the user input. 
    The attributes I need for each task goes as followed:
    Play song: play song, song_name
    Create playlist: create playlist, artist_name, playlist_name(optional)
    IF ANY ATTRIBUTE IS MISSING PLEASE ASK THE USER FOR THE MISSING ATTRIBUTE!
    Question: Can you play Fast Car
    Response: Play song, Fast Car

    Question: Can you make a playlist for Taylor Swift
    Response: Create playlist, Taylor Swift

    Question: Can you make a playlist for Skillet called my playlist
    Response: Create playlist, skillet, my playlist

    If you think the question is a request to do something with the weather then give me a phrase that corresponds to the action they want to do. Then give me the
    attributes needed to perform each task from the user input
    The attributes I need for each task goes as followed:
    Get forecast: get forecast, city_name

    Question: What's the weather today in New York?
    Response: get forecast, New York

    Question: What's the weather today in Staten Island?
    Response: get forecast, Staten Island
    """
    classifier_message = {
        "role": "system",
        "content": classifier
    }
    # check if the message_log is empty or the first message is not the classifier
    if not message_log or message_log[0] != classifier_message:
        message_log.insert(0, classifier_message)

    return message_log

"""
using the message from the user input and with context from the message log it 
sends the response to the proccess_response function to determine if any action 
is required if not then it will return a response
"""
def handle_message(user_input, message_log, tts_enabled=False):
    # append the user message to the message log
    message_log.append({"role": "user", "content": user_input})
    # Process the message through the OpenAI API
    chat_completion = client.chat.completions.create(
        messages=message_log,
        model="gpt-3.5-turbo"
    )
    # extract the response
    reply = chat_completion.choices[0].message.content
    message_log.append({"role": "assistant", "content": reply})
    # process the response to determine action
    response_text = process_response(reply, message_log, user_input)
    # return a dictionary containing the chatbot's response and any action taken
    return {"response": response_text}

"""
takes the chatbot response and checks if the question is to take a certain action 
that requires the use of a calendar or Spotify function, if it does it will call 
the function and respond with if the action was sucessful or if it was not
"""
def process_response(reply, message_log, user_input):
    info = reply.split(", ")
    # based on the action, call the appropriate function and generate a response
    if info[0] == "Create calendar":
        text = create_calendar(info[1], service)
    
    elif info[0] == "Delete calendar":
        text = delete_calendar(info[1], service)
    
    elif info[0] == "Create event":
        if len(info) == 5:
            text = create_event(info[1], info[2], info[3], info[4], service)
        else:
            text = create_event(info[1], info[2], info[3], info[4], service, info[5])
    
    elif info[0] == "Delete event":
        text = delete_event(info[1], info[2], service)
    
    elif info[0] == "Play song":
        text = play_song(get_token(), info[1])
    
    elif info[0] == "Create playlist":
        if len(info) == 3:
            text = create_playlist(info[1], info[2])
        else:
            text = create_playlist(info[1])
    elif info[0] == "Edit event":
        text = edit_event(info[1], info[2], user_input, service)
    elif info[0] == "Calendar_Information":
        text = calendar_information(info[1], user_input, service)
    
    #if no calendar function was called then it is a general question and the answer will be printed
    else:
        text = reply
    return text