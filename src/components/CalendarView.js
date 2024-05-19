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
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', startDate: '', startTime: '', endDate: '', endTime: '' });
    const [currentDate, setCurrentDate] = useState('');
    
    // gets the currrent date and stores it so that it can be displayed later
    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setCurrentDate(formattedDate);
    }, []);

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
    
    // calls on the flask app to use the delete event function to delete an event when the user clicks the x next to the specified event
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

    // recieves all of the information of the event
    const handleEditEvent = (event) => {
        const [originalStartDate, originalStartTime] = event.start.split('T');
        const [originalEndDate, originalEndTime] = event.end.split('T');
        setEditingEvent({
            id: event.id,
            title: event.title,
            startDate: originalStartDate,
            startTime: originalStartTime.substring(0, 5),
            endDate: originalEndDate,
            endTime: originalEndTime.substring(0, 5),
            originalTitle: event.title,
            originalStartDate: originalStartDate,
            originalStartTime: originalStartTime,
            originalEndDate: originalEndDate,
            originalEndTime: originalEndTime
        });
        setIsEditing(true);
    };

    // this helps keep the format of the date time in a way that the google calendar can use
    const formatDateTime = (date, time, originalTime) => {
        time = time || originalTime.split('T')[1].substring(0, 5);
        const timeZone = originalTime ? originalTime.slice(-6) : '-04:00'; 
        return `${date}T${time}:00${timeZone}`;
    };

    // updates the information of the event on the front end
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
        // checks to make sure that the start time isnt after the end time and vice versa
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);
        if (startDateTime >= endDateTime) {
            alert("The start time/date cannot be later than the end time/date.");
            return; // Stop the function from proceeding
        }
        // if this is unchanged it will use the original value
        const title = editingEvent.title || editingEvent.originalTitle;
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
            fetchEvents();
        })
        .catch((error) => console.error('Error:', error));
    };

    // allows the information for a new event to be sent to the back end so that it can be created
    const createNewEvent = () => {
        const start = `${newEvent.startDate}T${newEvent.startTime}:00-04:00`;
        const end = `${newEvent.endDate}T${newEvent.endTime}:00-04:00`;
        fetch(`http://localhost:5000/create-event/${selectedCalendar}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newEvent.title,
                start: start,
                end: end
            }),
        })
        .then(response => response.json())
        .then(() => {
            setIsAdding(false);
            setNewEvent({ title: '', startDate: '', startTime: '', endDate: '', endTime: '' });
            fetchEvents(); // Refresh events list
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
            <h2>{currentDate}</h2>
            <div className="controls">
                <select
                    value={selectedCalendar}
                    onChange={(e) => setSelectedCalendar(e.target.value)}
                    className="calendar-select"
                >
                    <option value="">Select a Calendar</option>
                    {calendars.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                            {calendar.summary}
                        </option>
                    ))}
                </select>
                <button onClick={handleRefresh} className="button icon-button refresh-button">⟳</button>
                <button onClick={() => setIsAdding(true)} className="button icon-button add-event-button">+</button>
            </div>
            <div className="upcoming-events">
                {events.map((event) => (
                    <div key={event.id} className="event-item">
                        <span>{event.date}</span>
                        <h4>{event.title}</h4>
                        <p>{event.time}</p>
                        <button className="delete-button" onClick={() => handleDeleteEvent(event.title, calendars.find(cal => cal.id === selectedCalendar)?.summary || '')}>X</button>
                        <button className="edit-button" onClick={() => handleEditEvent(event)}>✏️</button>
                    </div>
                ))}
            </div>

            {isEditing && (
                <ReactModal 
                    isOpen={isEditing}
                    onRequestClose={() => setIsEditing(false)}
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.75)'
                        },
                        content: {
                            color: 'white',
                            background: '#2c2c2c',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '20px'
                        }
                    }}
                >
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
            {isAdding && (
                <ReactModal 
                    isOpen={isAdding} 
                    onRequestClose={() => setIsAdding(false)}
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.75)'
                        },
                        content: {
                            color: 'white',
                            background: '#2c2c2c',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '20px'
                        }
                    }}
                >
                    <h2>Add New Event</h2>
                    <label>
                        Event Name:
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        />
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={newEvent.startDate}
                            onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                        />
                    </label>
                    <label>
                        Start Time:
                        <input
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={newEvent.endDate}
                            onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                        />
                    </label>
                    <label>
                        End Time:
                        <input
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                        />
                    </label>
                    <button onClick={createNewEvent}>OK</button>
                    <button onClick={() => setIsAdding(false)}>Cancel</button>
                </ReactModal>
            )}
        </div>
    );
};

export default CalendarView;