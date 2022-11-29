// server/index.js

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const {MongoClient} = require('mongodb');


const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads/");
  },
  filename: (req, file, callBack) => {
    console.log(file);
    callBack(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);


const uri = "mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri);

try {
  client.connect();
  console.log('connected');

} catch (e) {
  console.error(e);
}

// function to upload files to database
app.post("/upload", upload.array("files"), (req, res) => {
  console.log(req.files);

  try {
    client.db('eLearningDatabase').collection('fileuploads').insertMany(req.files);
    res.json({ message: "Successfully uploaded files" });
  } catch (e) {
    console.log(e);
  }
});

app.get("/readfiles", (req, res) => {
  client.db('eLearningDatabase').collection('fileuploads').find({}).toArray(
    function(err, result) {
      if (err) throw err;
      res.send(result);}
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
