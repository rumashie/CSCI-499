import React, { useState, useEffect, useRef } from 'react';
import './WidgetSection.css';

// uses the browsers speech recognition in order to recieve audable inputs

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// this insures that the browser only listens for a single phrase instead of multiple and 
// that only the entire final phrase in returned and not every singular word
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}

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
    const isTtsEnabledRef = useRef(isTtsEnabled);

    // checks if the microphone button is active or not if it is it will listen to 
    // the audio coming from the users mic and if not it will stop the voice reconition until pressed again
    const toggleListen = () => {
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            try {
                recognition.start();
            } catch (error) {
                console.error("Speech recognition error: ", error);
            }
        }
    };

    useEffect(() => {
        isTtsEnabledRef.current = isTtsEnabled;
    }, [isTtsEnabled]);

    // checks the microphone button to see if the application needs to listen for an audio input
    useEffect(() => {
        if (recognition) {
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInputMessage(transcript);
                sendMessageToChatbot(transcript);
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
        return () => {
            if (recognition) {
                recognition.abort();
            }
        };
    }, [recognition]);

    // saves the message log
    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);

    // makes sure that the chat window is always scrolled all the way down after a input so that users dont have to keep scrolling down
    useEffect(() => {
        const scrollToBottom = () => {
            if (chatboxBodyRef.current) {
                chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
            }
        };

        scrollToBottom();
    }, [messages]);

    // sends and recieves chatbot messages through calling the functions from the chatbot file and then saves it to the message history
    const sendMessageToChatbot = async (text = inputMessage) => {
        if (!text.trim()) return;
        setInputMessage('');
        setMessages(currentMessages => [
            ...currentMessages,
            { from: 'user', text }
        ]);
        setIsLoading(true);
        try {
            const requestBody = {
                message: text,
                conversation: messages.map(msg => ({
                    role: msg.from === 'assistant' ? 'assistant' : 'user',
                    content: msg.text
                })),
                ttsEnabled: isTtsEnabled,
            };
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            setMessages(currentMessages => [
                ...currentMessages,
                { from: 'assistant', text: data.response }
            ]);
            if (isTtsEnabledRef.current) {
                const utterance = new SpeechSynthesisUtterance(data.response);
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
            setInputMessage('');
        }
    };

    // clears the chat message history
    const clearMessageHistory = () => {
        setMessages([]);
        localStorage.removeItem('messages');
    };

    return (
        <div className="widget-section">
            <div className="widget ai-bot-container">
                <div className="container">
                    <div className="chatbox-header">
                        <span>Jarvis AI</span>
                        <div>
                            <button className="clear-history-button" onClick={clearMessageHistory}>Clear</button>
                            <button
                                className={`tts-toggle-button ${isTtsEnabled ? 'enabled' : ''}`}
                                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                            >
                                {isTtsEnabled ? 'TTS On' : 'TTS Off'}
                            </button>
                        </div>
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
                        <button className="send-button" onClick={() => sendMessageToChatbot()}>
                            <span>Send</span>
                            <i className="fas fa-paper-plane"></i>
                        </button>
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
