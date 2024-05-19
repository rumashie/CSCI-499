import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';


const Signup = () => {
    // Define state variables for form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    // Function to handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Send form data to server
        const response = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName, lastName, username, email, password }),
        });
  
        if (response.ok) //response status is successful
        {
          // redirect to login page 
        navigate('/login');
        console.log("Successfully made new account")
        } 
        else {
          // Handle signup error (e.g., display error message)
          console.error('Signup failed:', response.statusText);
        }
      } 
      catch (error) {
        console.error('Signup failed:', error.message);
      }
    };



return (
<section>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div id="first-name">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div id="last-name">
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div id="username">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div id="user-email">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div id="password">
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div id="error-message"></div>
      <Link to="/login" id="back-to-Login-Link">Back to Login Page</Link>
    </section>
  );
};

export default Signup;