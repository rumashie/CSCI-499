import React from 'react';
import './CalendarView.css';

const CalendarView = () => {
  const events = [
    { id: 1, date: '05/12', title: 'Workshop', time: '2:00-2:45 PM' },
    { id: 2, date: '06/12', title: 'Text Leo to push this', time: '11:00 AM-2:45' },
    { id: 3, date: '07/12', title: 'Text Massiel for the hw', time: '12:00-12:25 PM' },
    { id: 4, date: '08/12', title: 'Facetime my boy Ruski', time: '4:00-5:00 PM' },
    { id: 5, date: '09/12', title: 'Business Meeting @ 6', time: '4:00-4:30 PM' },
  ];

  return (
    <div className="calendar-view">
      <h2>March 2024</h2>
      <div className="calendar-grid">
        {/* need to add google calender here my boy leo add this */}
      </div>
      <div className="upcoming-events">
        <h3>Upcoming events on your calendar</h3>
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <span>{event.date}</span>
            <h4>{event.title}</h4>
            <p>{event.time}</p>
          </div>
        ))}
      </div>
      <button className="view-schedule-button">View entire schedule</button>
    </div>
  );
};

export default CalendarView;
