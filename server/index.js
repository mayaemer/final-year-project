// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3001;

const FilesModel = require("./models/InsertFile");

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

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});