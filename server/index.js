// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'uploads/');
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

mongoose.connect(
  "mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
)
.then(()=>console.log('connected'))
.catch(e=>console.log(e));;

// app.get("/read"), async (req, res) => {
//   // FilesModel.find({}, (err, result) => {
//   //   if (err){
//   //     res.send(err)
//   //   }
//   //   res.send(result);
//   // });
// }

const FilesModel = require("./models/InsertFile");

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

app.get("/readfiles", (req, res) => {
  FilesModel.find({}, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
