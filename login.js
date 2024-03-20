module.exports = function(app, pool, bcrypt) {
  // Serve the login page
  app.get('/login', (req, res) => {
      // Ensure the path to login.html is correct based on your directory structure
      res.sendFile('login.html', { root: 'public' });
  });

  // Handle login attempts
  app.post('/login', (req, res) => {
      const { email, password } = req.body;

      // Find user via email
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
                  console.log('logged in successfully');
                  res.json({ success: true, message: 'Success' });
              } else {
                  // Passwords don't match
                  res.status(401).json({ success: false, message: 'Incorrect Password' });
              }
          });
      });
  });
};
