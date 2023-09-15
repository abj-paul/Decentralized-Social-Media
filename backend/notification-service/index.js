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
const PORT = 3000;
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
    res.send("Notification Service Server running...");
})



app.get('/api/v1/user/notification', (req, response) => {
    const userId = req.query.userId;
    console.log("GETTING NOTIFICATION FOR "+userId);


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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
