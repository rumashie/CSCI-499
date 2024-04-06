import React, { useState, useEffect, useRef } from 'react';
import './WidgetSection.css';

// uses the browsers speech recognition in order to recieve audable inputs
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
// this insures that the browser only listens for a single phrase instead of multiple and 
// that only the entire final phrase in returned and not every singular word
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
    const isTtsEnabledRef = useRef(isTtsEnabled);
    // checks if the microphone button is active or not if it is it will listen to 
    // the audio coming from the users mic and if not it will stop the voice reconition until pressed again
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
    // makes sure that it checks the text_to_speech box to make sure to only use it if activated
    useEffect(() => {
        isTtsEnabledRef.current = isTtsEnabled;
    }, [isTtsEnabled]);
    // gets the audio from the users mic and strings it together into a vailid input
    useEffect(() => {
        // recieves the audio input and proccesses into text and 
        // inputs it to the message view and calls on the chatbot function
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
        // makes sure to disable any ongoing recognition whenever the stop button is pressed
        return () => {
            if (recognition) {
                recognition.abort();
            }
        };
    // eslint-disable-next-line
    }, [recognition]);

    // checks the messages in the local storage and sets it to the new message log
    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setMessages(savedMessages);
    }, []);

    // makes sure that the user doesnt have to keep scrolling whenever a new message appears in the bottom
    useEffect(() => {
        // create a function to handle the scrolling
        const scrollToBottom = () => {
          if (chatboxBodyRef.current) {
            chatboxBodyRef.current.scrollTop = chatboxBodyRef.current.scrollHeight;
          }
        };
      
        // call scrollToBottom whenever a message is added that would be off the screen
        scrollToBottom();
      }, [messages]);;

    // sends and recieves chatbot messages through calling the functions from the chatbot file and then saves it to the message history
    // sends and receives chatbot messages through calling the functions from the chatbot file and then saves it to the message history
const sendMessageToChatbot = async (text = inputMessage) => {
    if (!text.trim()) return; // Check if the text parameter is empty or only consists of whitespace
    setInputMessage('');
    // immediately adds the user's message to the chat
    setMessages(currentMessages => [
        ...currentMessages,
        { from: 'user', text }
    ]);
    // starts the loading icon while the chatbot gets a response
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
        // calls the chat function from the flask app to send the user input in order to get a response from the chatbot
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

        // if the text to speech button is enabled then it will preform the action
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
                        <button className="send-button" onClick={() => sendMessageToChatbot()}>Send 👋🏻</button>
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