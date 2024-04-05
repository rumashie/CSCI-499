import React from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaCalendarAlt, FaChartPie, FaUsers, FaQuestionCircle } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <Link to="/" className="active">
            <FaTasks className="icon" />
            <span>My tasks</span>
          </Link>
        </li>
        <li>
          <Link to="/">
            <FaCalendarAlt className="icon" />
            <span>Upcoming tasks</span>
          </Link>
        </li>
        <li>
          <Link to="/productivity">
            <FaChartPie className="icon" />
            <span>Productivity</span>
          </Link>
        </li>
        <li>
          <Link to="/">
            <FaUsers className="icon" />
            <span>Collaborators</span>
          </Link>
        </li>
        <li>
          <Link to="/">
            <FaQuestionCircle className="icon" />
            <span>Help</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
