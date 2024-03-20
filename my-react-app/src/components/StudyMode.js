import React, { useState, useEffect, useRef } from 'react';
import './StudyMode.css';

const StudyMode = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const initialDuration = useRef(0);
  const intervalRef = useRef(null);

  // Need to remove this, this shit hurts my head. def need to organize this code/ very sloppy 
  const startTimer = () => {
    let totalSeconds = hours * 3600 + minutes * 60;
    setTimeRemaining(totalSeconds);
    initialDuration.current = totalSeconds;
    setIsTimerRunning(true);
  };

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      intervalRef.current = interval;

      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0) {
      clearInterval(intervalRef.current);
      setIsTimerRunning(false);
      alert('Timer has completed!'); 
    } else {
      setProgress((1 - timeRemaining / initialDuration.current) * 360);
    }
  }, [timeRemaining]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="session-timer-container">
      <h2>SESSION 1</h2>
      <div className="timer-controls">
        <div>
          <label htmlFor="hours">H: </label>
          <input
            type="number"
            id="hours"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value, 10))}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="minutes">M: </label>
          <input
            type="number"
            id="minutes"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
            className="input-field"
          />
        </div>
        <button onClick={startTimer} disabled={isTimerRunning} className={`timer-button ${isTimerRunning ? 'running' : ''}`}>
          {isTimerRunning ? 'Timer Running' : 'Start Timer'}
        </button>
      </div>
      <div
        className="session-progress-bar"
        style={{
          background: `conic-gradient(#333 0deg, #333 ${progress}deg, transparent 0deg)`,
        }}
      >
        <span className="timer-value">{formatTime(timeRemaining)}</span>
      </div>
      <p className="remaining-text">Remaining</p>
      <button
        className="exit-session-button"
        onClick={() => {
          clearInterval(intervalRef.current);
          setIsTimerRunning(false);
          setTimeRemaining(0);
          setProgress(0);
        }}
      >
        Exit session early
      </button>
    </div>
  );
};

export default StudyMode;
