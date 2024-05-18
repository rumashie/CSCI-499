from flask import Flask, request, jsonify
from flask_cors import CORS
from Chatbot import handle_message, init_messages
from Google import create_service
from GoogleCalendar import list_calendars, fetch_events, delete_event, edit_event_front, create_event_front
from urllib.parse import unquote
from EmailGPT import get_email_summaries, send_email_response

CLIENT_SECRET_FILE = 'path/to/your/client_secret.json'
API_NAME = 'calendar'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/calendar']

app = Flask(__name__)
CORS(app)

"""
checks all of the users calendars on google calendar and returns them in a list,
this list is used in the drop down feature on the CalendarView.js file
"""
@app.route('/calendars', methods=['GET'])
def get_calendars():
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    calendars = list_calendars(service)
    return jsonify(calendars)

"""
checks the users google calendar and puts all of the events into a list,
only the first 5 events are returned to the frontend 
"""
@app.route('/events', methods=['POST'])
def get_events():
    data = request.get_json()
    calendar_id = data.get('calendarId')
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    events = fetch_events(calendar_id, service, 10)
    return jsonify(events)

"""
recieves the input from the textbox in the frontend and sends the
message to the chatbot functions to proccess and respond then the message
is saved into the conversation logs
"""
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    conversation = data.get('conversation', [])
    tts_enabled = data.get('ttsEnabled', False)
    conversation = init_messages(conversation)
    response = handle_message(user_message, conversation, tts_enabled=tts_enabled)
    return jsonify(response)

"""
when the x button next to an event is pressed that events info is sent ot this route
that will take the info and call the delete event function to delete the event off of
the users calendar
"""
@app.route('/delete-event/<calendar_name>/<event_name>', methods=['DELETE'])
def delete_event_route(calendar_name, event_name):
    calendar_name = unquote(calendar_name)
    event_name = unquote(event_name)
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    response = delete_event(calendar_name, event_name, service)
    return jsonify({'message': response}), 200

"""
when an event is edited in the calendar view widget the changes are sent to this
route which will call the edit event function to update the event with the new
information the user changed
"""
@app.route('/edit-event/<calendar_id>/<event_id>', methods=['POST'])
def edit_event_route(calendar_id, event_id):
    data = request.get_json()
    new_title = data.get('newTitle')
    new_start = data.get('newStart')
    new_end = data.get('newEnd')
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    response = edit_event_front(calendar_id, event_id, new_title, new_start, new_end, service)
    if response:
        return jsonify({'message': 'Event updated successfully'}), 200
    else:
        return jsonify({'message': 'Failed to update event'}), 500

"""
when an event is added through the UI on the front-end the inforamtion is sent here
where the create_event_front function is called to create the event on the users calendar 
"""
@app.route('/create-event/<calendar_id>', methods=['POST'])
def create_event_route(calendar_id):
    data = request.get_json()
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    response = create_event_front(calendar_id, data['title'], data['start'], data['end'], service)
    return jsonify({'message': response}), 200

"""
for email summarizer route pulls emails from your gmail here and displays to frontend. Also send's email from the frontend.
    
"""
@app.route('/email-summaries', methods=['GET'])
def get_email_summaries_route():
    email_summaries = get_email_summaries()
    return jsonify(email_summaries)

@app.route('/collab', methods=['POST'])
def respond_to_email():
    data = request.get_json()
    email_id = data.get('emailId')
    response = data.get('response')
    send_email_response(email_id, response)
    return jsonify({'message': 'Email sent successfully'})


"""
Used to search through your inbox of emails
    
"""
@app.route('/email-summaries-search', methods=['GET'])
def get_email_summaries_search_route():
    search_query = request.args.get('search', '')
    email_summaries = get_email_summaries(search_query)
    return jsonify(email_summaries)

if __name__ == '__main__':
    app.run(debug=True)
