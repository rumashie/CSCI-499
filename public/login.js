const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');


const app = express();
const portExpress = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = mysql.createPool({
  host: 'capstone.cdoge0oyalpz.us-east-1.rds.amazonaws.com',
  port: '3306',
  user: 'admin',
  password: 'hunterhawk499',
  database: 'capstone'
});



app.post('/login', (req, res) => {
  const { email, password } = req.body;

  //Find user via Email
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
      return;
    }
  
    if (results.length === 0) {
      // User not found
      res.status(401).json({ success: false, message: 'Email not registered' });
      return;
    }
  
    const user = results[0];
    const hashedPassword = user.password;
  
    // Compare the entered password with the hashed password
    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords: ', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
      }
  
      if (isMatch) {
        // Passwords match, login successful
        res.json({ success: true, message: 'Success'});
      } 
      
      else {
        // Passwords don't match
        res.status(401).json({ success: false, message: 'Incorrect Password' });
      }
    });
  });

});

// Start the server
app.listen(portExpress, () => {
  console.log(`Server is running on port ${PORT}`);
});
