import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Header.css';

/* Accesses user's first name from Database that Login Page saved in local storage */
const Header = () => {
  const navigate = useNavigate();  
  const firstName = localStorage.getItem('firstName') || 'User';

  const handleLogout = () => {
    localStorage.clear();  // Clears the localStorage
    navigate('/login');  
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Hello, {firstName}</h1>

        <div className="button-group">
            <button>Settings</button>
            <button onClick={handleLogout}>Logout</button> 
        </div>
      </div>
    </header>
  );
};

export default Header;
