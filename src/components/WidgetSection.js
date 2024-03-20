import React, { useState, useEffect } from 'react';
import './WidgetSection.css';

const WidgetSection = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Load saved messages from localStorage and update the state
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);

    const sendMessageToChatbot = async () => {
      if (!inputMessage.trim()) return; // Prevent sending empty messages
  
      // Construct the request body, including the conversation history
      // Note: Change 'from' field value from 'bot' to 'assistant' for messages from the chatbot
      const requestBody = {
          message: inputMessage,
          conversation: messages.map(msg => ({
              role: msg.from === 'bot' ? 'assistant' : msg.from, // Change 'bot' to 'assistant'
              content: msg.text
          }))
      };
  
      try {
          const response = await fetch('http://localhost:5000/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
          });
  
          const data = await response.json();
  
          // Update conversation history with both user message and chatbot's response
          // Note: Here as well, ensure the 'from' field for chatbot messages is 'assistant'
          setMessages(currentMessages => {
              const updatedMessages = [
                  ...currentMessages, 
                  { from: 'user', text: inputMessage },
                  { from: 'assistant', text: data.response } // Use 'assistant' instead of 'bot'
              ];
              // Save updated messages to localStorage
              localStorage.setItem('messages', JSON.stringify(updatedMessages));
              return updatedMessages;
          });
  
          setInputMessage(''); // Clear input field after sending
      } catch (error) {
          console.error("Failed to send message:", error);
      }
    };
    const clearMessageHistory = () => {
      // Clear the messages state
      setMessages([]);
  
      // Clear the messages from localStorage
      localStorage.removeItem('messages');
    };
  

    return (
      <div className="widget-section">
          <div className="widget ai-bot-container">
              <div className="container">
                  <div className="chatbox-header">
                      Jarvis 🤖 
                      <button className="clear-history-button" onClick={clearMessageHistory}>Clear History</button>
                  </div>
                  <div className="chatbox-body">
                      {messages.map((msg, index) => (
                          <div key={index} className={`message-bubble ${msg.from === 'assistant' ? 'bot-message' : 'user-message'}`}>
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
                          onKeyDown={e => { if (e.key === 'Enter') { sendMessageToChatbot(); e.preventDefault(); } }}
                      />
                      <button className="send-button" onClick={sendMessageToChatbot}>Send 👋🏻</button>
                  </div>
              </div>
          </div>
      </div>
    );
};

export default WidgetSection;