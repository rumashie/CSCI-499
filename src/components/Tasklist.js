//simple create user task and display it. kw filter based on urgency. 

import React, { useState } from 'react';
import './Tasklist.css';
import { FaTimesCircle } from 'react-icons/fa';

const Tasklist = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Grab a slice of pizza', completed: false, priority: 'low' },
    { id: 2, title: 'Finish my assignment later', completed: false, priority: 'medium' },
    { id: 3, title: 'Catch Mew with masterball', completed: false, priority: 'high' },
  ]);

  const addTask = () => {
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();
    if (task !== '') {
      const priority = getTaskPriority(task);
      const newTask = {
        id: tasks.length + 1,
        title: task,
        description: '',
        completed: false,
        priority: priority,
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

  const getTaskPriority = (taskTitle) => {
    const lowPriorityKeywords = [];
    const mediumPriorityKeywords = ['medium', 'moderate', 'average', 'at', '@'];
    const highPriorityKeywords = ['high', 'important', 'critical', 'major', 'urgent', 'deadline', 'due', 'midnight'];

    const lowercaseTitle = taskTitle.toLowerCase();
    if (lowPriorityKeywords.some((keyword) => lowercaseTitle.includes(keyword))) {
      return 'low';
    } else if (mediumPriorityKeywords.some((keyword) => lowercaseTitle.includes(keyword))) {
      return 'medium';
    } else if (highPriorityKeywords.some((keyword) => lowercaseTitle.includes(keyword))) {
      return 'high';
    } else {
      return 'low';
    }
  };

  return (
    <div className="task-list">
      <h2>My tasks</h2>
      <div className="task-list-items">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
          >
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
              />
            </div>
            <div className="task-details">
              <h3>{task.title}</h3>
            </div>
            <div className="task-actions">
              <div className={`priority-flag ${task.priority}`}></div>
              <FaTimesCircle className="delete-icon" onClick={() => deleteTask(task.id)} />
            </div>
          </div>
        ))}
      </div>
      <div className="task-input-container">
        <input id="task-input" type="text" placeholder="Add a task" />
        <button className="add-task-button" onClick={addTask}>
          <span className="plus-icon">+</span>
        </button>
      </div>
    </div>
  );
};

export default Tasklist;
