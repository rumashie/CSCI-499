module.exports = function(app, pool, bcrypt){
  
  // Define route handler for root URL
  app.get('/', (req, res) => {
    res.send('Registration page.');
  });

  app.post('/register', (req, res) => {
   const { firstName, lastName, username, email, password } = req.body;

//Hash Password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }


  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if email or username already exists
    connection.query('SELECT COUNT(*) AS emailCount FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        connection.release();
        console.error('Error checking email:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      const emailCount = results[0].emailCount;

      
      if (emailCount > 0) {
        connection.release();
        return res.redirect('/signup.html?error=' + encodeURIComponent('Email already registered. Try Again'));
      }
      

      // Check for unique username
      connection.query('SELECT COUNT(*) AS usernameCount FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
          connection.release();
          console.error('Error checking username:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        const usernameCount = results[0].usernameCount;

        // Check if username already exists
        if (usernameCount > 0) {
          connection.release();
          return res.redirect('/signup.html?error=' + encodeURIComponent('Username already exists. Try Again'));

        }
        
        // Insert user into the database
        const sql = 'INSERT INTO users (firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [firstName, lastName, username, email, hashedPassword], (error, results) => {
          connection.release();
          if (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Internal server error' });
          }
          // Redirect to login page
          res.redirect('/login.html');
        });
      });
    });
  });
});
});


};
