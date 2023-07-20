const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

// Sample user data (Replace this with a database in a real application)
const users = [
  { id: 1, username: 'user1', password: '$2a$10$Fm5d5wZxtpQX4G7Kv6kUZuP6Bzry5lgFTxAmRKt3Tp9PpJpjifCMm' }, // Password: secret1
  { id: 2, username: 'user2', password: '$2a$10$N1/5X6KFUMGPhN2MCNzRZeI0H9mzRxhWRqQr6ziCBh2N5IhCVyRK2' }, // Password: secret2
];

app.use(express.json());

// Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Generate a salt and hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.status(500).json({ message: 'Error during password hashing' });

    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Error during password hashing' });

      // Save the user in the database (Replace this with database operations in a real application)
      users.push({ id: users.length + 1, username, password: hash });
	console.log(hash)
      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login and generate a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Compare the provided password with the hashed password
  bcrypt.compare(password, user.password, (err, result) => {
      console.log(result);
    if (err || !result) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
    return res.json({ message: 'Authentication successful', token });
  });
});

// A protected route that requires authentication
app.get('/protected', (req, res) => {
  const token = req.headers.authorization;

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Token is valid, proceed with the protected action
    return res.json({ message: 'Protected data accessed successfully', user: decoded });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
