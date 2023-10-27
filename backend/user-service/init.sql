CREATE DATABASE IF NOT EXISTS DeSo;
USE DeSo;
CREATE TABLE IF NOT EXISTS users(
    userid INT auto_increment primary key,
    username varchar(30) NOT NULL,
    password varchar(60) NOT NULL,
    profilePicture varchar(50),
    facialRecognition varchar(50),
    user_description varchar(200)
);