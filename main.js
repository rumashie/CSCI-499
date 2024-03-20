const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');  //Hash
 

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//connect to db
const pool = mysql.createPool({
  host: 'capstone.cdoge0oyalpz.us-east-1.rds.amazonaws.com',
  port: '3306',
  user: 'admin',
  password: 'hunterhawk499',
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

app.use(express.static(path.join(__dirname, 'public')));


//IMPORT login and sign-up modules
require('./login')(app,pool,bcrypt);
require('./registration')(app,pool,bcrypt);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
