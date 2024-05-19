import React, { useState, useEffect } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom'; 

function Login() {
  const navigate = useNavigate();


  // Check if already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Define state variables for email, password, and an error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // The handleSubmit function handles form submission and communicates with server
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      // Server Approves Login
      if (response.ok) {
        // Handle successful login
        const data = await response.json(); 
        console.log("User's first name:", data.firstName); // Specifically log the firstName
    
        localStorage.setItem("authenticated", "true"); // Store authentication status
        localStorage.setItem('firstName', data.firstName); // Store the user's first name as username
    
        console.log("Stored First Name:", localStorage.getItem('firstName')); // Confirm what's stored in localStorage
    
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        // Handle login error
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <section>
      <h1>Login</h1>
      <form id="loginForm" onSubmit={handleLogin}>
        {error && <p className="error">{error}</p>}  {/* Display error message if there is one */}
        <div id="user-email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$"
          />
        </div>

        <div id="password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>

        <div id="login">
          <button type="submit">Submit</button>
        </div>
      </form>
      <Link to="/signup" id="create-account">Create Account</Link>
    </section>
  );
};

export default Login;
