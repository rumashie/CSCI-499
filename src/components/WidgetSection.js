import React, { useState, useEffect, useRef } from 'react';
import './WidgetSection.css';

const LoadingIndicator = () => {
    return (
        <div className="loading-indicator">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
        </div>
    );
};

const WidgetSection = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatboxBodyRef = useRef(null);

    useEffect(() => {
        // Load saved messages from localStorage and update the state
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);
    useEffect(() => {
        if (chatboxBodyRef.current) {
            chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessageToChatbot = async () => {
        if (!inputMessage.trim()) return;
        setMessages(currentMessages => [
            ...currentMessages,
            { from: 'user', text: inputMessage }
        ]);
        setInputMessage(''); // Clear input field
        setIsLoading(true); // Start loading

        const requestBody = {
            message: inputMessage,
            conversation: messages.map(msg => ({
                role: msg.from === 'assistant' ? 'assistant' : 'user',
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

            // Update conversation history with chatbot's response and stop loading
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