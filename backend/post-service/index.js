const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Minio = require('minio');
const DatabaseService = require("./libs/DatabaseService.js");
const authorize = require('./libs/authorizationMiddleware.js');
const FormData = require('form-data');
const axios = require('axios');


// Constants
const PORT = 3001;
const minioClient = new Minio.Client({
  endPoint: 'minio',
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
    const post_table_creation_query = `
CREATE TABLE IF NOT EXISTS posts(
    postId INT auto_increment primary key,
    userId INT,
    textContent varchar(500) NOT NULL,
    imageContent varchar(100) NOT NULL );
`;

    DatabaseService.executeQuery(post_table_creation_query)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

    res.send("Post table has been created.");
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/api/v1/user/post/:postId', (req, response) => {
    const postId = req.params.postId; // Access the postId from route parameters
    console.log("Getting post with Id=" + postId);

    if (!postId) {
        return response.status(400).json({ message: 'postId is required' });
    }

    DatabaseService.executeQuery('SELECT userId, postId, textContent, imageContent FROM posts WHERE posts.postId=' + postId)
        .then((result) => {
            response.status(200).send({ "postContent": result });
        });
});
app.get('/api/v1/user/post', (req, response) => {
    const userId = req.query.userId;
    console.log("GETTING TIMELINE CONTENT");

    if (!userId) {
	return response.status(400).json({ message: 'userId is required' });
    }
    
    DatabaseService.executeQuery('SELECT userId, postId, textContent, imageContent FROM posts WHERE userId!='+userId)
	.then((result)=>{
	    const posts = shuffleArray(result);

	    response.status(200).send({"posts":posts});
	});
});

function getFirstSentence(textContent) {
  const sentenceEndRegex = /[.!?]/;
  const sentencesArray = textContent.split(sentenceEndRegex);
  const firstSentence = sentencesArray[0].trim();

  return firstSentence;
}

app.post('/api/v1/user/post', upload.single('imageContent'), (req, res) => {
    const textContent = req.body.textContent;
    const imageContent = req.file;
    const userId = req.body.userId;

    console.log("UPLOAD POST");
    console.log(req.body);

    if (!req.file) {
        console.log("No image found. Inserting text only.");
        DatabaseService.executeQuery(`INSERT INTO posts(userId, textContent, imageContent) VALUES(${userId}, '${textContent}', 'noimage');`)
	    .then((respond)=>{
		axios.get('http://172.21.0.2:3000/api/v1/user/list', {
		    params: {
			userId: userId
		    }
		})
		    .then((response)=>{
			const userList = response.data.userList;
			for(let i=0; i<userList.length; i++){
			    const tempUserId = userList[i]['userid'];
			    const notification = {
				"postId": respond.insertId,
				"userId": tempUserId,
				"notificationMessage": getFirstSentence(textContent),
				"pSeen": 0
			    };
			    
			    axios.post('http://127.24.0.3:3002/api/v1/user/notification', notification);
			}
		    })
		return res.status(200).send({"message":"Post uploaded."});
	    })
	return;
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
    const serverUrl = 'http://127.26.0.4:9000';
    const bucketName = 'posts';
    const imageUrl = `${serverUrl}/${bucketName}/${objectName}`;

	DatabaseService.executeQuery(`INSERT INTO posts(userId, textContent, imageContent) VALUES(${userId}, '${textContent}', '${imageUrl}');`)
	    .then((respond)=>{
		console.log(respond.insertId);
		//DatabaseService.executeQuery('SELECT * FROM users WHERE userid!='+userId)
		axios.get('http://172.21.0.2:3000/api/v1/user/list', {
		    params: {
			userId: userId
		    }
		})
		    .then((response)=>{
			console.log(response);
			const userList = response.data.userList;
			for(let i=0; i<userList.length; i++){
			    const tempUserId = userList[i]['userid'];
			    const notification = {
				"postId": respond.insertId,
				"userId": tempUserId,
				"notificationMessage": getFirstSentence(textContent),
				"pSeen": 0
			    };
			    
			    axios.post('http://172.24.0.3:3002/api/v1/user/notification', notification);
			}

			return res.status(200).send({'message':'Image uploaded successfully.'});
		    })
		})
		
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
