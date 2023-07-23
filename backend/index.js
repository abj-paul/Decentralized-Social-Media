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
const job = require('./job.js');


// Constants
const PORT = 3000;
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'GvlsbZl6KfYZeXsNLMOY',
  secretKey: '6ADMJ6Q8T6ggGOZIuQ6PaUtbaughSWzBGpwTM9rH',
});

uploadedImages = []

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' });
app.use('/api/v1/images', authorize);
app.use('/api/v1/user', authorize);


// Job 
setInterval(function() {
    job.cleanNotification();
  }, 10 * 1000); // 10 * 10000 milsec = 10s


// API Endpoints
app.get('/api/v1/', (req,res)=>{
    res.send("Server running...");
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


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/api/v1/user/post/get', (req, response) => {
    const userId = req.query.userId;
    console.log("GETTING TIMELINE CONTENT");

    if (!userId) {
	return response.status(400).json({ message: 'userId is required' });
    }
    
    DatabaseService.executeQuery('SELECT users.userId, postId, username, textContent, imageContent FROM posts, users WHERE users.userId=posts.userId and users.userId!='+userId)
	.then((result)=>{
	    const posts = shuffleArray(result);
	    response.status(200).send({"posts":posts});
	});
});

app.post('/api/v1/user/post/upload', upload.single('imageContent'), (req, res) => {
    const textContent = req.body.textContent;
    const imageContent = req.file;
    const userId = req.body.userId;

    console.log("UPLOAD POST");
    console.log(req.body);

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
	DatabaseService.executeQuery(`INSERT INTO posts(userId, textContent, imageContent) VALUES(${userId}, '${textContent}', '${objectName}');`)
	    .then((respond)=>{
		console.log(respond.insertId);
		DatabaseService.executeQuery('SELECT * FROM users WHERE userid!='+userId)
		    .then((userList)=>{
			for(let i=0; i<userList.length; i++){
				const tempUserId = userList[i]['userid'];
				DatabaseService.executeQuery(`INSERT INTO notification(postId, userId, notificationMessage, pSeen) VALUES(${respond.insertId}, '${tempUserId}', '${getFirstSentence(textContent)}', 0);`);
			}

			return res.status(200).send('Image uploaded successfully.');
		    })
		})
		
    });
});

function getFirstSentence(textContent) {
  const sentenceEndRegex = /[.!?]/;
  const sentencesArray = textContent.split(sentenceEndRegex);
  const firstSentence = sentencesArray[0].trim();

  return firstSentence;
}


app.get('/api/v1/user/notification', (req, response) => {
    const userId = req.query.userId;

    DatabaseService.executeQuery('SELECT A.userId,B.postId,C.username, A.notificationMessage FROM notification A, posts B , users C WHERE A.postId = B.postId and B.userId=C.userId and A.pSeen=0 and A.userId='+userId)
	.then((notifications)=>{
	    response.status(200).send({"notifications":notifications});
	})
});

app.patch('/api/v1/user/notification', (req, response) => {
    const postId = req.body.postId;
    const userId = req.body.userId;

    DatabaseService.executeQuery(`UPDATE notification SET pSeen=1 WHERE postId=${postId} and userId=${userId};`)
	.then((notifications)=>{
	    response.status(200).send({"notifications":notifications});
	})
});


/*
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
*/

// Endpoint to get the image by name
app.get('/api/v1/images/:imageName', (req, res) => {
  const { imageName } = req.params;

  // Find the corresponding object name in the array
  //const uploadedImage = uploadedImages.find(img => img.imageName === imageName);

  /*if (!uploadedImage) {
    return res.status(404).send('Image not found.');
  }*/

  const bucketName = 'posts'; // Replace with your desired bucket name
  //const objectName = uploadedImage.objectName;
  const objectName = imageName;

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
