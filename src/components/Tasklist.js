import React, { useState } from 'react';
import './Tasklist.css';

const Tasklist = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Presentations are due today' },
    { id: 2, title: 'Meeting @ 1:00 PM' },
    { id: 3, title: 'Catch Zeus in HeartGold' },
  ]);

  const addTask = () => {
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();

    if (task !== '') {
      const newTask = {
        id: tasks.length + 1,
        title: task,
        description: '',
      };

      setTasks([...tasks, newTask]);
      taskInput.value = '';
    }
  };

  const getColor = (taskTitle) => {
    const importantKeywords = ['important', 'critical', 'urgent', 'deadline', 'today'];
    const somewhatImportantKeywords = ['meeting', 'presentation', 'appointment', 'review'];
    
    if (containsAny(taskTitle, importantKeywords)) {
      return 'rgb(255, 127, 127)';
    } else if (containsAny(taskTitle, somewhatImportantKeywords)) {
      return 'rgb(255, 211, 1)';
    } else {
      return 'rgb(123, 182, 98)';
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
          <div key={task.id} className="task-item" style={{ backgroundColor: getColor(task.title) }}>
            <h3>{task.title}</h3>
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

