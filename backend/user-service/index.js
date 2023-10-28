const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');
const DatabaseService = require("./libs/DatabaseService.js");
const authorize = require('./libs/authorizationMiddleware.js');
const FormData = require('form-data');
const axios = require('axios');
const servers = require('./servers');


// Constants
const PORT = servers.USER_SERVICE_PORT ;
const app = express();

app.use(express.json());
app.use(cors());
//app.use('/api/v1/user/list', authorize);

// API Endpoints
app.get('/api/v1/', (req,res)=>{
    const user_table_creation_query = `
CREATE TABLE IF NOT EXISTS users(
    userid INT auto_increment primary key,
    username varchar(30) NOT NULL,
    password varchar(60) NOT NULL,
    profilePicture varchar(50),
    facialRecognition varchar(50),
    user_description varchar(200)
)
`;
    DatabaseService.executeQuery(user_table_creation_query)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

    
    res.send("User table has been created.");
})

app.post('/api/v1/authentication/register', (req, res) => {
    const { username, password, description } = req.body;

    DatabaseService.executeQuery('SELECT * FROM users')
	.then((users)=>{
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
	})
});

app.post('/api/v1/authentication/login', (req, res) => {
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
		
		const token = jwt.sign({ userId: user.id, username: user.username }, 'mySecretKeyIsYou<3', { expiresIn: '1h' });
		console.log("Logging in.... "+token);
		return res.json({ message: 'Authentication successful',  "userId" : user["userid"], "username" : user["username"], "description" : user["description"], token  });
	    });
	    
	});
    });


app.get('/api/v1/user/list', (req, res) => {
    const userId = req.query.userId;
    DatabaseService.executeQuery('SELECT * FROM users WHERE userid!='+userId)
	.then((userList)=>{
	    console.log(`DEBUG: User list endpoint - ${userList}`);
	    res.status(200).send({"userList": userList});
	});
});

app.post('/api/v1/user/authorize', (req,res)=>{
	const token= req.body.token;
	console.log(`DEBUG: Reached authorization endpoint!${token}`);
	const secretKey = "mySecretKeyIsYou<3";

	if (token == 'null') {
		return res.json({ success: false, message: 'No Token Provided' });
	}
	jwt.verify(token, secretKey, (err, userInfo) => {
		if (err) {
			console.log(err);
			console.log("NOT AUTHORIZED!!!");
			return res.status(403).send({success: false});
		}
		else {
			return res.status(200).send({success: true});
		}
	})
})

app.listen(PORT, () => {
    console.log(`User Server running on http://localhost:${PORT}`);
});
