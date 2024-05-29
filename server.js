/* 
Written: Massiel Sanchez
Course: CSCI499
server.js: Backend component to React App's Login and Sign-up component.
*/
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');  
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());

// Connect to Database
const pool = mysql.createPool({
    host: 'capstone.cdoge0oyalpz.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: ,
    database: 'capstone'
});

// Check database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database successfully!');
        connection.release();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} ...`);
});

// Routing Associated with the Login Page: Query Database and Authorize User
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Find user via email
    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length === 0) {
            // User not found
            return res.status(401).json({ success: false, message: 'Email not registered' });
        }
        //Email found in Database
        
        const user = results[0];
        const hashedPassword = user.password;

        // Compare the entered password with the hashed password
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords: ', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            if (isMatch) {
                // Passwords match, login successful
                return res.json({
                    success: true,
                    message: 'Login successful server.js hi',
                    firstName: user.firstName  // Make sure this matches the database field
                
                });
            } else {
                // Passwords don't match
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        });
    });
});

// Routing Associated with SignUp Page: Add New User to the Database
app.post('/signup', async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email or username already exists
        const emailQuery = 'SELECT COUNT(*) AS emailCount FROM users WHERE email = ?';
        const usernameQuery = 'SELECT COUNT(*) AS usernameCount FROM users WHERE username = ?';

        // Execute both queries in parallel
        const [emailResults, usernameResults] = await Promise.all([
            pool.query(emailQuery, [email]),
            pool.query(usernameQuery, [username])
        ]);

        // Log results for debugging
        console.log("Email results:", emailResults);
        console.log("Username results:", usernameResults);

        // Check if results are defined and access the counts safely
        const emailCount = emailResults && emailResults[0] ? emailResults[0].emailCount : 0;
        const usernameCount = usernameResults && usernameResults[0] ? usernameResults[0].usernameCount : 0;

        if (emailCount > 0) {
            return res.status(400).json({ error: 'Email already registered. Try Again' });
        }

        if (usernameCount > 0) {
            return res.status(400).json({ error: 'Username already exists. Try Again' });
        }

        // Insert user into the database
        const insertQuery = 'INSERT INTO users (firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?)';
        await pool.query(insertQuery, [firstName, lastName, username, email, hashedPassword]);

        // Respond with success message
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


