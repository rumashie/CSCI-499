import React, { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';
import './CalendarView.css';

// collects events from the selected calednar then posts the next 5 upcoming events for the user
const CalendarView = () => {
    const [calendars, setCalendars] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingEvent, setEditingEvent] = useState({ id: '', title: '', startDate: '', startTime: '', endDate: '', endTime: '' });


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
    const handleEditEvent = (event) => {
        const [originalStartDate, originalStartTime] = event.start.split('T');
        const [originalEndDate, originalEndTime] = event.end.split('T');
        setEditingEvent({
            id: event.id,
            title: event.title,
            startDate: originalStartDate,
            startTime: originalStartTime.substring(0, 5), // Assuming the format includes timezone like "HH:MM:SS-00:00"
            endDate: originalEndDate,
            endTime: originalEndTime.substring(0, 5), // Truncate to "HH:MM"
            originalTitle: event.title,
            originalStartDate: originalStartDate,
            originalStartTime: originalStartTime,
            originalEndDate: originalEndDate,
            originalEndTime: originalEndTime
        });
        setIsEditing(true);
    };
    
    const formatDateTime = (date, time, originalTime) => {
        // Use originalTime if new time is not provided to prevent unintended shifts
        time = time || originalTime.split('T')[1].substring(0, 5); // Assumes originalTime is in ISO format with timezone
    
        // Properly handle timezone. Extract timezone from originalTime if not manipulating time.
        const timeZone = originalTime ? originalTime.slice(-6) : '-04:00'; // Default to ET if no originalTime provided
    
        return `${date}T${time}:00${timeZone}`; // Keep the original timezone
    };

    const updateEvent = () => {
        const start = formatDateTime(
            editingEvent.startDate || editingEvent.originalStartDate,
            editingEvent.startTime,
            editingEvent.originalStart
        );
        const end = formatDateTime(
            editingEvent.endDate || editingEvent.originalEndDate,
            editingEvent.endTime,
            editingEvent.originalEnd
        );
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);
        if (startDateTime >= endDateTime) {
            alert("The start time/date cannot be later than the end time/date.");
            return; // Stop the function from proceeding
        }
        const title = editingEvent.title || editingEvent.originalTitle; // Use the original title if unchanged

        fetch(`http://localhost:5000/edit-event/${selectedCalendar}/${editingEvent.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newTitle: title,
                newStart: start,
                newEnd: end
            }),
        })
        .then(response => response.json())
        .then(() => {
            setIsEditing(false);
            fetchEvents(); // Refresh the events list
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
                        <button 
                            className="edit-button" 
                            onClick={() => handleEditEvent(event)}>✏️</button>
                    </div>
                ))}
            </div>
            <button className="view-schedule-button">View entire schedule</button>

            {isEditing && (
                <ReactModal isOpen={isEditing} onRequestClose={() => setIsEditing(false)}>
                    <h2>Edit Event</h2>
                    <label>
                        Event Name:
                        <input type="text" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} />
                    </label>
                    <label>
                        Start Date:
                        <input type="date" value={editingEvent.startDate} onChange={(e) => setEditingEvent({...editingEvent, startDate: e.target.value})} />
                    </label>
                    <label>
                        Start Time:
                        <input type="time" value={editingEvent.startTime} onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})} />
                    </label>
                    <label>
                        End Date:
                        <input type="date" value={editingEvent.endDate} onChange={(e) => setEditingEvent({...editingEvent, endDate: e.target.value})} />
                    </label>
                    <label>
                        End Time:
                        <input type="time" value={editingEvent.endTime} onChange={(e) => setEditingEvent({...editingEvent, endTime: e.target.value})} />
                    </label>
                    <button onClick={updateEvent}>OK</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </ReactModal>
            )}
        </div>
    );
};

export default CalendarView;