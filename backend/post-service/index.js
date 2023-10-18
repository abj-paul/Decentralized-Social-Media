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
const servers = require('../../servers');


// Constants
const PORT = servers.POST_SERVICE_PORT;
const minioClient = new Minio.Client({
  endPoint: servers.MINIO_SERVER,
  port: servers.MINIO_PORT,
  useSSL: false,
  accessKey: servers.MINIO_accessKey,
  secretKey: servers.MINIO_secretKey,
});

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
    imageContent varchar(100) NOT NULL);
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

app.post('/api/v1/user/post', upload.single('imageContent'), async (req, res) => {
    try {
        const { userId, textContent } = req.body;
        let imageContent = 'noimage';
        
        if (req.file) {
            // If an image file is provided, upload it to Minio
            const filePath = req.file.path;
            const metaData = {
                'Content-Type': req.file.mimetype,
            };
            
            const bucketName = 'posts'; // Replace with your desired bucket name
            const objectName = req.file.originalname;
            
            await minioClient.fPutObject(bucketName, objectName, filePath, metaData);
            
            // Update imageContent to the Minio object URL
            const serverUrl = `http://${servers.MINIO_SERVER}:${servers.MINIO_PORT}`;
            const imageUrl = `${serverUrl}/${bucketName}/${objectName}`;
            imageContent = imageUrl;
        }
        
        // Insert the post into the database
        const insertResult = await DatabaseService.executeQuery(`
            INSERT INTO posts(userId, textContent, imageContent)
            VALUES (${userId}, '${textContent}', '${imageContent}')
        `);
        
        // Fetch the user list
        const userServiceResponse = await axios.get(`${servers.USER_SERVICE_SERVER}:${servers.USER_SERVICE_PORT}/api/v1/user/list`, {
            params: {
                userId: userId
            }
        });
        
        const userList = userServiceResponse.data.userList;
	console.log(`DEBUG: User List Received = ${userList}`);
        
        // Create an array of notification promises
        const notificationPromises = userList.map(async (user) => {
            const tempUserId = user['userid'];
            const notification = {
                "postId": insertResult.insertId,
                "userId": tempUserId,
                "notificationMessage": getFirstSentence(textContent),
                "pSeen": 0
            };
            
            // Send a notification to each user
            await axios.post(`${servers.NOTIFICATION_SERVICE_SERVER}:${servers.NOTIFICATION_SERVICE_PORT}/api/v1/user/notification`, notification);
	          console.log(`DEBUG: Control reached into axios request on post notification.`);
        });
        
        // Wait for all notification promises to complete
	try{
            await Promise.all(notificationPromises);
	}catch(error){
            console.error('Error sending notification:', error.message);
	}
        
        return res.status(200).send({ 'message': 'Post uploaded successfully. Notifications sent.' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ 'message': 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
