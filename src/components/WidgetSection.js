import React from 'react';
import './WidgetSection.css';

const WidgetSection = () => {
  return (
    <div className="widget-section">
      <div className="widget productivity-rate">
        <h3>Productivity rate</h3>
        <span>Over 9000%</span>
      </div>
      <div className="widget weather">
        <h3>Weather</h3>
        {/* display weather forecast here image live need to add api leo slide */}
      </div>
      <div className="widget ai-bot-container"> {/* changes css for ai bot section add h3 tag below line for title*/}
        <div className="container">
          <div className="chatbox-header"> Jarvis 🤖 </div>
          <div className="chatbox-body">
            <div className="message-bubble bot-message">Good morning Bergen. How can I assist you King?</div>
          </div>
          <div className="input-container">
            <input type="text" className="input-field" placeholder="Write a message..." />
            <button className="send-button">Send 👋🏻</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetSection;
