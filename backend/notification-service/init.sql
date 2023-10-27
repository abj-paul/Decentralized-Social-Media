CREATE DATABASE IF NOT EXISTS DeSo;
USE DeSo;
CREATE TABLE IF NOT EXISTS notification(
    postId INT,
    userId INT,
    notificationMessage varchar(100) NOT NULL,
    pSeen TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (postId, userId));