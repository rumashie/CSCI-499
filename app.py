from flask import Flask, request, jsonify
from flask_cors import CORS
from Chatbot import handle_message, init_messages  # Make sure to import your function correctly
from Google import create_service
from GoogleCalendar import list_calendars, fetch_events  # Make sure to include create_event if not already imported

# You might need to configure these with your actual credentials and scopes
CLIENT_SECRET_FILE = 'path/to/your/client_secret.json'
API_NAME = 'calendar'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/calendar']

app = Flask(__name__)
CORS(app)

@app.route('/calendars', methods=['GET'])
def get_calendars():
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    calendars = list_calendars(service)
    return jsonify(calendars)

@app.route('/events', methods=['POST'])
def get_events():
    data = request.get_json()
    calendar_id = data.get('calendarId')
    service = create_service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    # You'll need to implement fetch_events in GoogleCalendar.py similar to list_calendars but for fetching events
    events = fetch_events(calendar_id, service)
    return jsonify(events)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    conversation = data.get('conversation', [])
    conversation = init_messages(conversation)
    response = handle_message(user_message, conversation)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
