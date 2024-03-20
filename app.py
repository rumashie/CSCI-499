from flask import Flask, request, jsonify
from flask_cors import CORS
from Chatbot import handle_message, init_messages  # Make sure to import your function correctly

app = Flask(__name__)
CORS(app)

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
