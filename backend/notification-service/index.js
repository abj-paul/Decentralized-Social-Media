const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');
const DatabaseService = require("./libs/DatabaseService.js");
const authorize = require('./libs/authorizationMiddleware.js');
const FormData = require('form-data');
const axios = require('axios');
const job = require('./libs/job.js');


// Constants
const PORT = 3002;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Job 
setInterval(function() {
    job.cleanNotification();
  }, 1000 * 1000); // 10 * 10000 milsec = 10s

// API Endpoints
app.get('/api/v1/', (req,res)=>{
    const notification_table_creation_query = `
CREATE TABLE IF NOT EXISTS notification(
    postId INT,
    userId INT,
    notificationMessage varchar(100) NOT NULL,
    pSeen TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (postId, userId));
`;

    DatabaseService.executeQuery(notification_table_creation_query)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });

    res.send("Notification table has been created.");
})



app.get('/api/v1/user/notification', (req, response) => {
    const userId = req.query.userId;
    console.log("GETTING NOTIFICATION FOR "+userId);


    DatabaseService.executeQuery('SELECT userId,postId,notificationMessage FROM notification WHERE userId='+userId)
	.then((notifications)=>{
	    response.status(200).send({"notifications":notifications});
	})
});
//DatabaseService.executeQuery(`INSERT INTO notification(postId, userId, notificationMessage, pSeen) VALUES(${respond.insertId}, '${tempUserId}', '${getFirstSentence(textContent)}', 0);`);

app.post('/api/v1/user/notification', (req, response) => {
    const postId = req.body.postId;
    const userId = req.body.userId;
    const notificationMessage = req.body.notificationMessage;
    const pSeen = req.body.pSeen;

    DatabaseService.executeQuery(`INSERT INTO notification(postId, userId, notificationMessage, pSeen) VALUES(${postId}, '${userId}', '${notificationMessage}', pSeen);`)
	.then((notification)=>{
	    console.log(`DEBUG: Notification for ${postId}, ${userId} has been inserted at ${notification.insertId}!`);
	    response.status(200).send({"status":`Successfully saved the notification at ${notification.insertId}`});
	});
});


app.patch('/api/v1/user/notification', (req, response) => {
    const postId = req.body.postId;
    const userId = req.body.userId;

    DatabaseService.executeQuery(`UPDATE notification SET pSeen=1 WHERE postId=${postId} and userId=${userId};`)
	.then((notifications)=>{
	    response.status(200).send({"notifications":notifications});
	})
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
