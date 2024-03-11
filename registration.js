const express = require('express');
const mysql = require('mysql');

const appExpress = express();
const portExpress = 3000;

appExpress.use(express.static('public'));
appExpress.use(express.urlencoded({ extended: true }));
appExpress.use(express.json());

//connect to db
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1325massi',
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

// Define route handler for root URL
appExpress.get('/', (req, res) => {
  res.send('Registration page.');
});

appExpress.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [username, email, password], (error, results) => {
      connection.release();
      if (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ message: 'User Created successfully' });
    });
  });
});

// Start the Express server
const server = appExpress.listen(portExpress, () => {
  console.log(`Express server is running on http://localhost:${portExpress}`);
});
