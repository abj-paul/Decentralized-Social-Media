const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Minio = require('minio');
const DatabaseService = require("./DatabaseService.js");
const authorize = require('./authorizationMiddleware.js');
const FormData = require('form-data');
const axios = require('axios');


// Constants
const PORT = 3000;
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'wBl9YHNf6XXfdMbWu0MS',
  secretKey: 'fpmlcbSbmge864KjPCwLn3WJ6PvQzblhqPCs8zaM',
});

uploadedImages = []

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' });
//app.use('/api/v1/images', authorize);
//app.use('/api/v1/user', authorize);




// API Endpoints
app.get('/api/v1/', (req,res)=>{
    res.send("Server running...");
})

app.post('/api/v1/authentication/register', (req, res) => {
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/api/v1/user/post/get', (req, response) => {
    const userId = req.query.userId;
    console.log(userId);
    DatabaseService.executeQuery('SELECT users.userId, postId, username, textContent, imageContent FROM posts, users WHERE users.userId=posts.userId and posts.userId='+userId)
	.then((result)=>{
	    const posts = shuffleArray(result);
	    response.status(200).send({"posts":posts});
	});
});

app.post('/api/v1/user/post/upload', upload.single('imageContent'), (req, res) => {
    const textContent = req.body.textContent;
    const imageContent = req.file;
    const userId = 1; // TODO

    if (!req.file) {
	return res.status(400).send('No image file found.');
    }

    const filePath = req.file.path;
    const metaData = {
	'Content-Type': req.file.mimetype,
    };

    const bucketName = 'posts'; // Replace with your desired bucket name
    const objectName = req.file.originalname;
    const imageName = req.file.originalname; // Save the image name

    minioClient.fPutObject(bucketName, objectName, filePath, metaData, (err, etag) => {
	if (err) {
	    console.log(err);
	    return res.status(500).send('Error uploading the image.');
	}
	
	console.log('Image uploaded successfully: ' + objectName);
	
	// Save the image name and object name association in the array
	uploadedImages.push({ imageName, objectName });
	console.log(uploadedImages);
	DatabaseService.executeQuery(`INSERT INTO posts(userId, textContent, imageContent) VALUES(${userId}, '${textContent}', '${objectName}');`)
	    .then((respond)=>{
		console.log(respond.insertId);
		DatabaseService.executeQuery(`INSERT INTO notification(postId, notificationMessage, pClicked) VALUES(${respond.insertId}, '${getFirstSentence(textContent)}', 0);`)
		    .then((a)=>{
			return res.status(200).send('Image uploaded successfully.');
		    })
	    });
    });
});
function getFirstSentence(textContent) {
  const sentenceEndRegex = /[.!?]/;
  const sentencesArray = textContent.split(sentenceEndRegex);
  const firstSentence = sentencesArray[0].trim();

  return firstSentence;
}

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
		
		const token = jwt.sign({ userId: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
		return res.json({ message: 'Authentication successful', token });
	    });
	    
	});
    });

app.get('/api/v1/user/timeline', (req, res) => {
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


app.post('/api/v1/images/upload', upload.single('image'), (req, res) => {
    console.log("Reached this api");
  if (!req.file) {
    return res.status(400).send('No image file found.');
  }

  const filePath = req.file.path;
  const metaData = {
    'Content-Type': req.file.mimetype,
  };

  const bucketName = 'posts'; // Replace with your desired bucket name
  const objectName = req.file.originalname;
  const imageName = req.file.originalname; // Save the image name

  minioClient.fPutObject(bucketName, objectName, filePath, metaData, (err, etag) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error uploading the image.');
    }

    console.log('Image uploaded successfully: ' + objectName);

    // Save the image name and object name association in the array
    uploadedImages.push({ imageName, objectName });

    return res.status(200).send('Image uploaded successfully.');
  });
});

// Endpoint to get the image by name
app.get('/api/v1/images/:imageName', (req, res) => {
  const { imageName } = req.params;

  // Find the corresponding object name in the array
  const uploadedImage = uploadedImages.find(img => img.imageName === imageName);

  if (!uploadedImage) {
    return res.status(404).send('Image not found.');
  }

  const bucketName = 'posts'; // Replace with your desired bucket name
  const objectName = uploadedImage.objectName;

  minioClient.getObject(bucketName, objectName, (err, dataStream) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error retrieving the image.');
    }

    // Pipe the data stream to the response to serve the image
    dataStream.pipe(res);
  });

});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
