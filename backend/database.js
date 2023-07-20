const DatabaseService = require("./DatabaseService.js");

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

const post_table_creation_query = `
CREATE TABLE IF NOT EXISTS posts(
    postId INT auto_increment primary key,
    userId INT,
    postContent varchar(500) NOT NULL,
    contentType varchar(10) NOT NULL,
    CONSTRAINT fk_post_user_userId FOREIGN KEY(userId) REFERENCES users(userid) ON DELETE CASCADE);
`;
const notification_table_creation_query = `
CREATE TABLE IF NOT EXISTS notification(
    notificationId INT auto_increment primary key,
    postId INT,
    notificationMessage varchar(100) NOT NULL,
    pClicked TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_notification_posts_postId FOREIGN KEY(postId) REFERENCES posts(postId) ON DELETE CASCADE);
`;


DatabaseService.executeQuery(user_table_creation_query)
    .then((result)=>{
	DatabaseService.executeQuery(post_table_creation_query)
	    .then((result)=>{
		DatabaseService.executeQuery(notification_table_creation_query)
		    .then((result)=>{
			console.log("Done loading all tables.")
		    });
	    });
    });


