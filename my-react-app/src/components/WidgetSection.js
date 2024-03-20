import React, { useState } from 'react';
import './WidgetSection.css';

const WidgetSection = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessageToChatbot = async () => {
    console.log("sendMessageToChatbot called");
    if (!inputMessage.trim()) return;  // Prevent sending empty messages

    const requestBody = { message: inputMessage };
    try {
      const response = await fetch('http://localhost:5000/chat', { // Adjust the URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Update conversation history with both user message and chatbot's response
      setMessages(messages => [...messages, { from: 'user', text: inputMessage }, { from: 'bot', text: data.response }]);
      
      setInputMessage(''); // Clear input field after sending
    } catch (error) {
      console.error("Failed to send message: ", error);
    }
  };

  return (
    <div className="widget-section">
      <div className="widget ai-bot-container">
        <div className="container">
          <div className="chatbox-header"> Jarvis 🤖 </div>
          <div className="chatbox-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.from === 'bot' ? 'bot-message' : 'user-message'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              className="input-field"
              placeholder="Write a message..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessageToChatbot(); }}
            />
            <button className="send-button" onClick={sendMessageToChatbot}>Send 👋🏻</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetSection;
