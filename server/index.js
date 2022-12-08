// server/index.js

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const {MongoClient} = require('mongodb');

// stack overflow https://stackoverflow.com/questions/31592726/how-to-store-a-file-with-file-extension-with-multer
// adds extension of file
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

// connect to mongodb
const uri = "mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

try {
  client.connect();
  console.log('connected');

} catch (e) {
  console.error(e);
}

// function to upload files to database
app.post("/upload", upload.array("files"), async(req, res) => {
  console.log(req.files);

  try {
    client.db('eLearningDatabase').collection('fileuploads').insertMany(req.files);
    res.json({ message: "Successfully uploaded files" });
  } catch (e) {
    console.log(e);
  }
});

// read all entries from file uploads collection
app.get("/readfiles", (req, res) => {
  client.db('eLearningDatabase').collection('fileuploads').find({}).toArray(
    function(err, result) {
      try{
        res.send(result);
      }
      catch(e){
        console.log(e)
      }
      
    })
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
