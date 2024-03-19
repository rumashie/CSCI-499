from flask import Flask, request, jsonify
from flask_cors import CORS
from Chatbot import handle_message  # Make sure to import your function correctly

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    response = handle_message(user_message)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)