// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3001;

const FilesModel = require("./models/InsertFile");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

mongoose.connect(
  "mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);

// app.get("/read"), async (req, res) => {
//   // FilesModel.find({}, (err, result) => {
//   //   if (err){
//   //     res.send(err)
//   //   }
//   //   res.send(result);
//   // });
// }

app.get("/readfiles", (req, res) => {
  FilesModel.find({}, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
});

app.post("/readselectedfile", (req, res) => {
  const selectedFile = req.query.selectedFile;
  // need to find how to retrieve file from within a collection of collections
});

// function to upload files to database
app.post("/upload", upload.array("files"), (req, res) => {
  console.log(req.files);
  const files = new FilesModel({
    _id: new mongoose.Types.ObjectId(),
    fileCollection: req.files,
  });
  try {
    files.save();
    res.json({ message: "Successfully uploaded files" });
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
