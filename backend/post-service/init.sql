CREATE DATABASE IF NOT EXISTS DeSo;
USE DeSo;
CREATE TABLE IF NOT EXISTS posts(
    postId INT auto_increment primary key,
    userId INT,
    textContent varchar(500) NOT NULL,
    imageContent varchar(100) NOT NULL);