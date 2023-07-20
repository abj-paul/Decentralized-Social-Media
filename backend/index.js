const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

const DatabaseService = require("./DatabaseService.js");

app.use(express.json());

app.post('/register', (req, res) => {
    const { username, password, description } = req.body;

  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).json({ message: 'Error during password hashing' });

      bcrypt.hash(password, salt, (err, hash) => {
	  if (err) return res.status(500).json({ message: 'Error during password hashing' });
	  users.push({ id: users.length + 1, username, password: hash });
	  DatabaseService.executeQuery(
	      `INSERT INTO users(username, password, user_description) VALUES ('${username}', '${hash}', '${description}');`
	  );
	  return res.status(201).json({ message: 'User registered successfully' });
      });
  });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    DatabaseService.executeQuery(`SELECT * FROM users`)
	.then((users)=>{
	    const user = users.find(user => user.username === username);
	    
	    if (!user) {
		return res.status(401).json({ message: 'Authentication failed' });
	    }

	    bcrypt.compare(password, user.password, (err, result) => {
		console.log(result);
		if (err || !result) {
		    return res.status(401).json({ message: 'Authentication failed' });
		}
		
		const token = jwt.sign({ userId: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
		return res.json({ message: 'Authentication successful', token });
	    });
	    
	});
    });

app.get('/protected', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
	return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
	if (err) {
	    return res.status(401).json({ message: 'Invalid token' });
	}
	return res.json({ message: 'Protected data accessed successfully', user: decoded });
  });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
