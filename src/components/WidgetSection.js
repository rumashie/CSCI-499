import React, { useState, useEffect, useRef } from 'react';
import './WidgetSection.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen for a single utterance
    recognition.lang = 'en-US';
    recognition.interimResults = false; // Only final results are needed
}

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
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatboxBodyRef = useRef(null);
    // retreives the message history in order for the chatbot to use for context

    const toggleListen = () => {
        if (isListening) {
            recognition.stop(); // Stop the recognition if it's already listening
            setIsListening(false); // Update the listening state
        } else {
            try {
                recognition.start(); // Start the recognition if not already listening
            } catch (error) {
                console.error("Speech recognition error: ", error);
            }
        }
    };
    
    useEffect(() => {
        if (recognition) {
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInputMessage(transcript); // Update the input field with the transcript
                sendMessageToChatbot(transcript); // Send the transcript as a message
                setInputMessage('');
            };
    
            recognition.onstart = () => {
                setIsListening(true);
            };
    
            recognition.onend = () => {
                setIsListening(false);
            };
    
            recognition.onerror = (event) => {
                console.error("Speech recognition error: ", event.error);
                setIsListening(false);
            };
        }
        // Ensure cleanup of recognition on component unmount
        return () => {
            if (recognition) {
                recognition.abort(); // Ensure to abort any ongoing recognition when the component unmounts
            }
        };
    // eslint-disable-next-line
    }, [recognition]);

    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);
    // makes sure that the user doesnt have to keep scrolling whenever a new message appears in the bottom
    useEffect(() => {
        // Create a function to handle the scrolling
        const scrollToBottom = () => {
          if (chatboxBodyRef.current) {
            chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
          }
        };
      
        // Call scrollToBottom whenever the messages state changes
        scrollToBottom();
      }, [messages]);;

    // sends and recieves chatbot messages through calling the functions from the chatbot file and then saves it to the message history
    // sends and receives chatbot messages through calling the functions from the chatbot file and then saves it to the message history
const sendMessageToChatbot = async (text = inputMessage) => {
    if (!text.trim()) return; // Check if the text parameter is empty or only consists of whitespace
    setInputMessage('');
    // Immediately add the user's message to the chat
    setMessages(currentMessages => [
        ...currentMessages,
        { from: 'user', text } // Add the user's message
    ]);
    
    setIsLoading(true); // Indicate loading state for the chatbot's response
    
    try {
        const requestBody = {
            message: text, // The message to send to the chatbot
            conversation: messages.map(msg => ({
                role: msg.from === 'assistant' ? 'assistant' : 'user',
                content: msg.text
            })),
            ttsEnabled: isTtsEnabled,
        };
        
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        
        // Add the chatbot's response to the chat
        setMessages(currentMessages => [
            ...currentMessages,
            { from: 'assistant', text: data.response } // Add the chatbot's response
        ]);

        if (isTtsEnabled) {
            const utterance = new SpeechSynthesisUtterance(data.response);
            speechSynthesis.speak(utterance);
        }
    } catch (error) {
        console.error("Failed to send message:", error);
    } finally {
        setIsLoading(false); // Stop loading regardless of success or error
        setInputMessage(''); // Clear input field after processing the message
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
                        {/* TTS Toggle */}
                        <label className="tts-toggle-label">
                            Text-to-Speech:
                            <input
                                type="checkbox"
                                className="tts-toggle-checkbox"
                                checked={isTtsEnabled}
                                onChange={() => setIsTtsEnabled(!isTtsEnabled)}
                            />
                        </label>
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
                        <button className={`voice-button ${isListening ? 'listening' : ''}`} onClick={toggleListen}>
                            {isListening ? '🛑' : '🎙️'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetSection;