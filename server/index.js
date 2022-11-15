// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads/' });

const PORT = process.env.PORT || 3001;

const FilesModel = require("./models/InsertFile");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

mongoose.connect( 'mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority', 
  {
    useNewUrlParser: true,
  }
);

app.get('/', async (req, res) => {
  const files = new FilesModel({fileName: 'Text.txt'});
  try {
    await files.save();
    res.send('inserted data');
  } catch(e){
    console.log(e);
  }
})


app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});