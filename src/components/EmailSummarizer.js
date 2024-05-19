import React, { useState, useEffect } from 'react';
import './EmailSummarizer.css';

const LoadingDots = () => {
  return (
    <div className="loading-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );
};


const EmailSummarizer = () => {
  const [emailSummaries, setEmailSummaries] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmailSummaries = async () => {
      try {
        const response = await fetch('http://localhost:5000/email-summaries');
        const data = await response.json();
        setEmailSummaries(data);
        setSelectedEmail(data[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching email summaries:', error);
        setIsLoading(false);
      }
    };
    fetchEmailSummaries();
  }, []);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setResponse('');
  };

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleResponseSubmit = async () => {
    try {
      const requestBody = {
        emailId: selectedEmail.id,
        response: response,
      };
      const response = await fetch('http://localhost:5000/collab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      console.log('Email sent:', data.message);
      setResponse('');
    } catch (error) {
      console.error('Error responding to email:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/email-summaries-search?search=${searchQuery}`);
      const data = await response.json();
      setEmailSummaries(data);
      setSelectedEmail(data[0]);
    } catch (error) {
      console.error('Error searching emails:', error);
    }
  };

  return (
    <div className="email-summarizer">
      <div className="email-list">
        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {isLoading ? (
          <LoadingDots />
        ) : (
          emailSummaries.map((email, index) => (
            <div
              key={index}
              className={`email-item ${selectedEmail === email ? 'selected' : ''} ${email.priority}-priority`}
              onClick={() => handleEmailClick(email)}
            >
              <div>
                <h3>{email.subject}</h3>
                <p>From: {email.sender}</p>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedEmail && (
        <div className="email-details">
          <h3>{selectedEmail.subject}</h3>
          <p className="email-summary">{selectedEmail.summary}</p>
          {selectedEmail.attachments.map((attachment, index) => (
            <div key={index} className="attachment">
              <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt={attachment.filename} />
              <p>{attachment.filename}</p>
            </div>
          ))}
          <div className="response-section">
            <textarea
              value={response}
              onChange={handleResponseChange}
              placeholder="Compose email.."
            />
            <button onClick={handleResponseSubmit}>Send Response</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSummarizer;