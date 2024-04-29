import React, { useState, useEffect, useRef } from 'react';
import './StudyMode.css';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaTimesCircle } from 'react-icons/fa';

const StudyMode = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(22222);
  const [progress, setProgress] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionData, setSessionData] = useState({
    sessions: [],
    goals: {
      daily: 2,
      weekly: 7,
    },
  });
  const [dailyGoal, setDailyGoal] = useState(2);
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const initialDuration = useRef(0);
  const intervalRef = useRef(null);

  const [selectedPriority, setSelectedPriority] = useState('low');

  const startTimer = () => {
    if (selectedTask) {
      let totalSeconds = hours * 3600 + minutes * 60;
      setTimeRemaining(totalSeconds);
      initialDuration.current = totalSeconds;
      setIsTimerRunning(true);
    }
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
      saveSessionData();
      moveTaskToCompleted();
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

  const saveSessionData = () => {
    const newSession = {
      date: new Date().toISOString(),
      duration: initialDuration.current / 3600,
      notes: notes,
    };
    setSessionData((prevData) => ({
      ...prevData,
      sessions: [...prevData.sessions, newSession],
    }));
    setNotes('');
  };

  const getDailyAverage = () => {
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessionData.sessions.filter((session) => session.date.slice(0, 10) === today);
    const totalDuration = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    const dailyAverage = todaySessions.length > 0 ? totalDuration / todaySessions.length : 0;
    return dailyAverage;
  };

  const getWeeklyAverage = () => {
    const today = new Date();
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const thisWeekSessions = sessionData.sessions.filter((session) => new Date(session.date) >= weekAgo);
    const totalDuration = thisWeekSessions.reduce((sum, session) => sum + session.duration, 0);
    const weeklyAverage = thisWeekSessions.length > 0 ? totalDuration / thisWeekSessions.length : 0;
    return weeklyAverage;
  };

  const dailyProgress = Math.min((getDailyAverage() / dailyGoal) * 100, 100);
  const weeklyProgress = Math.min((getWeeklyAverage() / weeklyGoal) * 100, 100);

  const chartData = {
    labels: sessionData.sessions.map((session) => new Date(session.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Analytics',
        data: sessionData.sessions.map((session) => session.duration),
        backgroundColor: '#95bdf2',
        borderColor: '#95bdf2',
        borderWidth: 1,
      },
    ],
  };

  const addTask = () => {
    if (newTaskTitle.trim() !== '') {
      const newTask = {
        id: tasks.length + 1,
        title: newTaskTitle.trim(),
        completed: false,
        priority: selectedPriority,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setSelectedPriority('low');
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };


  const moveTaskToInProgress = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTask.id) {
          return { ...task, completed: false };
        }
        return task;
      });
      setTasks(updatedTasks);
    }
  };

  const moveTaskToCompleted = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTask.id) {
          return { ...task, completed: true };
        }
        return task;
      });
      setTasks(updatedTasks);
      setSelectedTask(null);
    }
  };

  return (
    <div className="session-timer-container">
      <h2>Planner</h2>
      <div className="progress-tracker">
        <div className="progress-column">
          <h3>To Do</h3>
          <ul className="task-list">
            {tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <li
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={selectedTask && selectedTask.id === task.id ? 'selected' : ''}
                >
                  <span className={`priority-dot ${task.priority}`}></span>
                  <span className="task-title">{task.title}</span>
                </li>
              ))}
          </ul>
          <div className="task-input-container">
            <input
              id="task-input"
              type="text"
              placeholder="Add a task"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Priority</option>
              <option value="high">Urgent</option>
            </select>
            <button className="add-task-button" onClick={addTask}>
              <span className="plus-icon">+</span>
            </button>
          </div>
        </div>
        <div className="progress-column">
          <h3>In Progress</h3>
          <ul className="task-list">
            {selectedTask && !selectedTask.completed && <li>{selectedTask.title}</li>}
          </ul>
        </div>
        <div className="progress-column">
          <h3>Completed</h3>
          <ul className="task-list">
            {tasks
              .filter((task) => task.completed)
              .map((task) => (
                <li key={task.id}>
                  <span className={`priority-dot ${task.priority}`}></span>
                  <span className="task-title">{task.title}</span>
                  <FaTimesCircle className="delete-icon" onClick={() => deleteTask(task.id)} />
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="timer-and-reports">
        <div className="timer-section">
          <div className="timer-controls">
            <div className="input-group">
              <label htmlFor="hours">H:</label>
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value, 10))}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label htmlFor="minutes">M:</label>
              <input
                type="number"
                id="minutes"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                className="input-field"
              />
            </div>
            <button
              onClick={startTimer}
              disabled={isTimerRunning || !selectedTask}
              className={`timer-button ${isTimerRunning ? 'running' : ''}`}
            >
              {isTimerRunning ? 'Timer Running' : 'Start Timer'}
            </button>
          </div>
          <div
            className="session-progress-bar"
            style={{
              background: `conic-gradient(#fff ${progress}deg, #95bdf2 ${progress}deg)`,
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
              moveTaskToInProgress();
            }}
          >
            Exit session early
          </button>
        </div>
        <div className="reports-section">
          <div className="productivity-reports">
            <div className="averages">
              <p>Daily: {getDailyAverage().toFixed(2)} hours</p>
              <p>Weekly: {getWeeklyAverage().toFixed(2)} hours</p>
            </div>
            <div className="goals">
              <div className="input-group">
                <label htmlFor="dailyGoal">Daily Goal:</label>
                <input
                  type="number"
                  id="dailyGoal"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseFloat(e.target.value))}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label htmlFor="weeklyGoal">Weekly Goal:</label>
                <input
                  type="number"
                  id="weeklyGoal"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseFloat(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="progress-bars">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${dailyProgress}%` }}></div>
                <span className="progress-label">Daily Goal</span>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${weeklyProgress}%` }}></div>
                <span className="progress-label">Weekly Goal</span>
              </div>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
