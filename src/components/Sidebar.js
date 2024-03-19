import React from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaCalendarAlt, FaChartPie, FaUsers, FaQuestionCircle } from 'react-icons/fa'; // symbols random lib
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/"><FaTasks className="icon" /> My Tasks</Link></li>
        <li><Link to="/"><FaCalendarAlt className="icon" /> Upcoming Tasks</Link></li>
        <li><Link to="/StudyMode"><FaChartPie className="icon" /> Productivity</Link></li>
        <li><Link to="/"><FaUsers className="icon" /> Collaborators</Link></li>
        <li><Link to="/"><FaQuestionCircle className="icon" /> Help</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
