import React, { useState, useEffect, useRef } from 'react';
import './WidgetSection.css';

// creates a loading image whenever the chatbot is getting a response
const LoadingIndicator = () => {
    return (
        <div className="loading-indicator">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
        </div>
    );
};

// handles all the functionality of the chatbot on the front end
// recieves input from the submitted textbox then fetches a response 
// from the flask app to recieve a response then it saves the conversation history
const WidgetSection = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatboxBodyRef = useRef(null);
    // retreives the message history in order for the chatbot to use for context
    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);
    // makes sure that the user doesnt have to keep scrolling whenever a new message appears in the bottom
    useEffect(() => {
        if (chatboxBodyRef.current) {
            chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // sends and recieves chatbot messages through calling the functions from the chatbot file and then saves it to the message history
    const sendMessageToChatbot = async () => {
        if (!inputMessage.trim()) return;
        setMessages(currentMessages => [
            ...currentMessages,
            { from: 'user', text: inputMessage }
        ]);
        // creates a loading image when waiting for a message
        setInputMessage(''); // Clear input field
        setIsLoading(true); // Start loading
        const requestBody = {
            message: inputMessage,
            conversation: messages.map(msg => ({
                role: msg.from === 'assistant' ? 'assistant' : 'user',
                content: msg.text
            }))
        };
        // calls the chat function from the flask app to send the user input in order to get a response from the chatbot
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            // updates the coversation history every time the chatbot makes a response
            setMessages(currentMessages => [
                ...currentMessages,
                { from: 'assistant', text: data.response }
            ]);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false); // Stop loading regardless of success or error
        }
    };
    // this is for the clear button that deletes the chat history
        const clearMessageHistory = () => {
        setMessages([]);
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
                    <div className="chatbox-body" ref={chatboxBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.from === 'assistant' ? 'bot-message' : 'user-message'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <LoadingIndicator />}
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