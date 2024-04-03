import React, { useState } from 'react';
import './Tasklist.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Tasklist = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Presentations are due today', completed: false },
    { id: 2, title: 'Meeting @ 1:00 PM', completed: false },
    { id: 3, title: 'Catch Zeus in HeartGold', completed: false },
  ]);

  const addTask = () => {
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();
    if (task !== '') {
      const newTask = {
        id: tasks.length + 1,
        title: task,
        description: '',
        completed: false,
      };
      setTasks([...tasks, newTask]);
      taskInput.value = '';
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text'), 10);
    const updatedTasks = [...tasks];
    const draggedTask = updatedTasks.find((task) => task.id === taskId);
    const targetIndex = updatedTasks.findIndex((task) => task.id === targetTaskId);
    updatedTasks.splice(updatedTasks.indexOf(draggedTask), 1);
    updatedTasks.splice(targetIndex, 0, draggedTask);
    setTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const getColor = (taskTitle) => {
    const importantKeywords = ['important', 'critical', 'urgent', 'deadline', 'today'];
    const somewhatImportantKeywords = ['meeting', 'presentation', 'appointment', 'review'];
    if (containsAny(taskTitle, importantKeywords)) {
      return '#ff6b6b';
    } else if (containsAny(taskTitle, somewhatImportantKeywords)) {
      return '#f9c74f';
    } else {
      return '#90be6d';
    }
  };

  const containsAny = (str, keywords) => {
    const lowerCaseStr = str.toLowerCase();
    return keywords.some(keyword => lowerCaseStr.includes(keyword.toLowerCase()));
  };

  return (
    <div className="task-list">
      <h2>My tasks</h2>
      <div className="task-list-items">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            style={{ backgroundColor: getColor(task.title) }}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
          >
            <h3>{task.title}</h3>
            <div className="task-actions">
              <FaCheckCircle
                className="complete-icon"
                onClick={() => toggleTaskCompletion(task.id)}
              />
              <FaTimesCircle
                className="delete-icon"
                onClick={() => deleteTask(task.id)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="task-input-container">
        <input id="task-input" type="text" placeholder="Enter new task" />
        <button className="add-task-button" onClick={addTask}>+</button>
      </div>
    </div>
  );
};

export default Tasklist;
