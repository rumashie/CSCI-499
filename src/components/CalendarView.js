import React, { useState, useEffect, useCallback } from 'react';
import './CalendarView.css';

const CalendarView = () => {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');

  const fetchCalendars = useCallback(() => {
    fetch('http://localhost:5000/calendars')
      .then((response) => response.json())
      .then(setCalendars)
      .catch((error) => console.error('Error fetching calendars:', error));
  }, []);

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
      <div className="calendar-header">
        <h2>May 2024</h2>
        <div className="calendar-actions">
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
          <button onClick={handleRefresh} className="refresh-button">
            <i className="fas fa-sync"></i>
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-day">Sun</div>
        <div className="calendar-day">Mon</div>
        <div className="calendar-day">Tue</div>
        <div className="calendar-day">Wed</div>
        <div className="calendar-day">Thu</div>
        <div className="calendar-day">Fri</div>
        <div className="calendar-day">Sat</div>
      </div>

      <div className="upcoming-events">
        <h3>Upcoming events on your calendar</h3>
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-date">{event.date}</div>
            <div className="event-details">
              <h4>{event.title}</h4>
              <p>{event.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="view-schedule-button">View entire schedule</button>
    </div>
  );
};

export default CalendarView;
