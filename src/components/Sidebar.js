//nav bar for our web app

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTasks, FaCalendarAlt, FaChartPie, FaUsers, FaQuestionCircle } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/" exact activeClassName="active">
            <FaTasks className="icon" />
            <span>My tasks</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/upcoming" activeClassName="active">
            <FaCalendarAlt className="icon" />
            <span>Upcoming tasks</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/productivity" activeClassName="active">
            <FaChartPie className="icon" />
            <span>Productivity</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/collaborators" activeClassName="active">
            <FaUsers className="icon" />
            <span>Collaborators</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/help" activeClassName="active">
            <FaQuestionCircle className="icon" />
            <span>Help</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;