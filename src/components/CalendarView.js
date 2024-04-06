import React, { useState, useEffect, useCallback } from 'react';
import './CalendarView.css';

// collects events from the selected calednar then posts the next 5 upcoming events for the user
const CalendarView = () => {
    const [calendars, setCalendars] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState('');

    // sends a fetch request to the flask app to call a function that will return the list of 
    // calendars on the user's google calendar for the drop down box
    const fetchCalendars = useCallback(() => {
        fetch('http://localhost:5000/calendars')
        .then((response) => response.json())
        .then(setCalendars)
        .catch((error) => console.error('Error fetching calendars:', error));
    }, []);
    // sends a fetch request to the flask app to call a function 
    // that will return a list of events on the selected calendar
    const fetchEvents = useCallback(() => {
        if (selectedCalendar) {
        fetch('http://localhost:5000/events', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ calendarId: selectedCalendar }),
        })
            .then((response) => response.json())
            .then(setEvents)
            .catch((error) => console.error('Error fetching events:', error));
        }
    }, [selectedCalendar]);

    const handleDeleteEvent = (eventName, calendarName) => {
        fetch(`http://localhost:5000/delete-event/${encodeURIComponent(calendarName)}/${encodeURIComponent(eventName)}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            // Refresh events list to reflect deletion
            fetchEvents();
        })
        .catch((error) => console.error('Error:', error));
    };

    // used to refresh in case any changes are made to the users calendar
    useEffect(() => {
        fetchCalendars();
    }, [fetchCalendars]);
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    const handleRefresh = () => {
        fetchCalendars();
        fetchEvents();
    };
    return (
        <div className="calendar-view">
        <h2>March 2024</h2>
        <select
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
        >
            <option value="">Select a Calendar</option>
            {calendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
                {calendar.summary}
            </option>
            ))}
        </select>
        <button onClick={handleRefresh} className="refresh-button">Refresh</button>
        <div className="upcoming-events">
            {events.map((event) => (
                <div key={event.id} className="event-item">
                    <span>{event.date}</span>
                    <h4>{event.title}</h4>
                    <p>{event.time}</p>
                    <button 
                        className="delete-button" 
                        onClick={() => handleDeleteEvent(event.title, calendars.find(cal => cal.id === selectedCalendar)?.summary || '')}>X</button>
                </div>
            ))}
        </div>
        <button className="view-schedule-button">View entire schedule</button>
        </div>
    );
};

export default CalendarView;
