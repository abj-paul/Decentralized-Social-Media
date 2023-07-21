const express = require('express');
const multer = require('multer');
const Minio = require('minio');

const app = express();
const port = 3000;

// Set up MinIO client
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'wBl9YHNf6XXfdMbWu0MS',
  secretKey: 'fpmlcbSbmge864KjPCwLn3WJ6PvQzblhqPCs8zaM',
});

// Multer middleware to handle the file upload
const upload = multer({ dest: 'uploads/' });

// Serve the HTML file with the image upload form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle the image upload and store it on MinIO
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image file found.');
  }

  const filePath = req.file.path;
  const metaData = {
    'Content-Type': req.file.mimetype,
  };

  const bucketName = 'posts'; // Replace with your desired bucket name
  const objectName = req.file.originalname;

  minioClient.fPutObject(bucketName, objectName, filePath, metaData, (err, etag) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error uploading the image.');
    }

    console.log('Image uploaded successfully: ' + objectName);
    return res.status(200).send('Image uploaded successfully.');
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
