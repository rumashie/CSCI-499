"""
Developed by: Leonardo Gonzalez Luzon
"""


from openai import OpenAI
import constants
from GoogleCalendar import create_calendar, delete_calendar, create_event, delete_event
from Google import create_service
from Spotify import get_token, play_song, create_playlist
from weather import get_forecast

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
this classifier allows the chat bot to determine if the user is asking a general question 
to which it will respond with an answer or if the user is trying to something to their calendar
in that case responds with a list containing information related to the function that will be called
"""
classifier = """You are a chatbot assistant that helps people with their daily tasks. I want for you to respond to questions depending on what you think they are the type of question they are.
The possible types of questions are:
- A general question, that can be answered by the chatbot
- A request to do something with their calendar
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

IF ANY ATTRIBUTE IS MISSING PLEASE ASK THE USER FOR THE MISSING ATTRIBUTE!
IF THEY DON'T SPECIFY A DATE ASK THEM FOR THAT!
MAKE SURE START AND END TIMES ARE IN THIS FORMAT 2/25/2024 7:00am NOTHING SHOULD BE LEFT OUT, YOU NEED MONTH, DAY, YEAR, AND TIME!

Examples: 

Question: can you create an event on my school calendar called lunch at 12pm for 2 hours
Response: What is the date of the event you want to create?

Question: Create a calendar called test calendar
Response: Create calendar, test calendar

Question: Create an event called lunch at feb 25 2024 at 2pm for 2 hours on my test calendar
Response: Create event, test calendar, lunch, 2/25/2024 2:00pm, 2/25/2024 4:00pm

Question: Create an event called breakfast with friends at feb 25 2024 at 11pm for 4 hours on my test calendar with the description of lunch with my friends from school
Response: Create event, test calendar, breakfast with friends, 2/25/2024 11:00am, 2/25/2024 3:00pm, lunch with my friends from school

Question: Create an event called breakfast with friends at feb 25 2024 at 11pm for 4 hours with the description of lunch with my friends from school
Response: What calendar do you want to add it to?

Question: Create an event called breakfast with friends at 11pm for 4 hours on my test calendar with the description of lunch with my friends from school
Response: What is the date of the event you want to create?

Question: Delete test calendar for me
Response: Delete calendar, test calendar

Question: Delete lunch with friends on my test calendar
Response: Delete event, lunch with friends, test calendar

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

If you think the question is a request to do something with the weather then give me a phrase that corrisponds to the action they want to do. Then give me the
attributes needed to perform each task from the user input
The attributes I need for each task goes as followed:
Get forecast: get forcast, city_name

Question: What's the weather today in New York?
Response: get forecast, New York

Question: What's the weather today in Staten Island?
Response: get forecast, Staten Island
"""
# api will recieve these messages to make a response
message_log = [{'role' : "system", "content" : classifier}]
message = ""
# will allow users to keep asking multiple messages
while message != "exit":
    # take an input so the user can ask a question
    message = input()
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
    # splits the infromation for a calendar related function
    info = reply.split(", ")
    # checks the first element of the list info to see if a calendar function was called 
    if info[0] == "Create calendar":
        create_calendar(info[1], service)
    elif info[0] == "Delete calendar":
        delete_calendar(info[1], service)
    elif info[0] == "Create event":
        if len(info) == 5:
            create_event(info[1], info[2], info[3], info[4], service)
        else:
            create_event(info[1], info[2], info[3], info[4], service, info[5])
    elif info[0] == "Delete event":
        delete_event(info[1], info[2], service)
    elif info[0] == "play song":
        play_song(get_token(), info[1])
    elif info[0] == "create playlist":
        if len(info) == 3:
            create_playlist(info[1], info[2])
        else:
            create_playlist(info[1])
    elif info[0] == "get forecast":
        get_forecast(info[1])
    #if no calendar function was called then it is a general question and the answer will be printed
    else:
        print("\n" + reply + "\n")