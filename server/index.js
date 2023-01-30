// server/index.js

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const { body, validationResult } = require("express-validator");
const { MongoClient } = require("mongodb");

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

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    key: "userId",
    secret: "aVeryBigSecret2868$",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 1000,
    },
  })
);

// connect to mongodb
const uri =
  "mongodb+srv://mayaeoc:250897@cluster0.suy8qu3.mongodb.net/eLearningDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

try {
  client.connect();
  console.log("connected");
} catch (e) {
  console.error(e);
}

// function to upload files to database
app.post("/upload", upload.array("files"), async (req, res) => {
  console.log(req.files);

  try {
    client
      .db("eLearningDatabase")
      .collection("fileuploads")
      .insertMany(req.files);
    res.json({ message: "Successfully uploaded files" });
  } catch (e) {
    console.log(e);
  }
});

// read all entries from file uploads collection
app.get("/readfiles", (req, res) => {
  client
    .db("eLearningDatabase")
    .collection("fileuploads")
    .find({})
    .toArray(function (err, result) {
      try {
        res.send(result);
      } catch (e) {
        console.log(e);
      }
    });
});

// add new users to database, hash their passwords
app.post(
  "/register",
  [
    body("Email").isLength({ min: 3, max: 50 }).isEmail(),
    body("Fname").isLength({ max: 100 }),
    body("Sname").isLength({ max: 100 }),
    body("Pass").isLength({ min: 8, max: 50 }),
    body("Confirm").isLength({ min: 8, max: 50 }),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      if (req.body.Pass != req.body.Confirm) {
        res.send("Passwords do not match");
      } else {
        bcrypt.hash(req.body.Pass, saltRounds, (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            userData = {
              _id: req.body.Email,
              Fname: req.body.Fname,
              Sname: req.body.Sname,
              Pass: hash,
              UserType: req.body.UserType,
            };

            client
              .db("eLearningDatabase")
              .collection("users")
              .insertOne(userData)
              .then((result) => {
                res.status(201).json(result);
              })
              .catch((err) => {
                res.send("Account with the email entered already exists");
              });
          }
        });
      }
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
