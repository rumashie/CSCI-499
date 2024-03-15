import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>My tasks </li>
        <li>Upcoming tasks</li>
        <li>Productivity</li>
        <li>Collaborators</li>
        <li>Help</li>
      </ul>
    </nav>
  );
};

export default Sidebar;