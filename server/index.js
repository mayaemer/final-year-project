// server/index.js

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const { body, validationResult, check } = require("express-validator");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

const BadWordsNext = require("bad-words-next");
const en = require("bad-words-next/data/en.json");
//const { data } = require("jquery");
//const { emitWarning } = require("process");

const profanityCheck = new BadWordsNext({ data: en });

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
const db = client.db("eLearningDatabase");

try {
  client.connect();
  console.log("connected");
} catch (e) {
  console.error(e);
}

// function to upload files to database
app.post("/upload", upload.array("files"), async (req, res) => {
  //console.log(req.files);
  //console.log(req.body.title);

  const currDateTime = getCurrentDateTime();

  const uploadData = {
    title: req.body.title,
    dateOfCreation: currDateTime,
    creator: req.body.creator,
    group: req.body.groupId,
    files: req.files,
  };

  insertData(res, "fileuploads", uploadData);
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

app.post("/deleteContent", (req, res) => {
  const id = ObjectId(req.body.contentid);
  if (req.body.filename === undefined) {
    console.log(id);
    deleteItem(res, "fileuploads", id);
  } else {
    const filename = req.body.filename;
    removeFile(res, id, filename);
  }
});

const checkEmail = function (email) {
  return new Promise(function (resolve) {
    db.collection("users")
      .findOne({ _id: email })
      .then((data) => {
        resolve(data);
      })
      .catch((e) => console.log(e));
  });
};

function registerUser(res, userData) {
  db.collection("users")
    .insertOne(userData)
    .then((result) => {
      res.send({ message: "Success" });
    })
    .catch((err) => {
      res.send({ message: "Error, account not registered." });
    });
}

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
        res.send({ message: "Passwords do not match" });
      } else {
        bcrypt.hash(req.body.Pass, saltRounds, (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            const check = async (email) => {
              const result = await checkEmail(email);
              if (result === null && req.body.UserType === "Teacher") {
                userData = {
                  _id: req.body.Email,
                  Fname: req.body.Fname,
                  Sname: req.body.Sname,
                  Pass: hash,
                  UserType: req.body.UserType,
                  Groups: [],
                };

                registerUser(res, userData);
              } else if (result === null && req.body.UserType === "Student") {
                userData = {
                  _id: req.body.Email,
                  Fname: req.body.Fname,
                  Sname: req.body.Sname,
                  Pass: hash,
                  UserType: req.body.UserType,
                };

                registerUser(res, userData);
              } else {
                res.send({ message: "Account with email already exists." });
              }
            };

            check(req.body.Email);
          }
        });
      }
    }
  }
);

app.get("/authenticate", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true });
  } else {
    res.send({ loggedIn: false });
  }
});

//middleware to checks if token has been stored in local storage
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send(false);
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.send(false);
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

//checks user is authenticated with verify jwt middleware
app.get("/isAuthenticated", verifyJWT, (req, res) => {
  res.send(true);
});

app.post(
  "/login",
  [
    body("Email").isLength({ min: 3, max: 50 }).isEmail(),
    body("Pass").isLength({ min: 8, max: 50 }),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const email = req.body.Email;
      const pass = req.body.Pass;

      db.collection("users")
        .findOne({ _id: email })
        .then((result) => {
          bcrypt.compare(pass, result.Pass, (err, response) => {
            if (response) {
              const token = jwt.sign({ email }, "jwtSecret", {
                expiresIn: 86400,
              });

              req.session.user = result;

              res.json({ auth: true, token: token, result: result });
            } else {
              res.json({
                auth: false,
                message: "Wrong usersname/ password combination.",
              });
            }
          });
        })
        .catch((err) => {
          res.send("Fail");
          console.log(err);
        });
    }
  }
);

app.get("/check", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    res.clearCookie("userId");
    res.destroy.token;
    res.send({ loggedIn: false });
  }
});

app.post("/checkGroup", (req, res) => {
  const email = req.body.Email;
  //console.log(req.body);
  if (req.body.Usertype === "Teacher") {
    getTeachersGroups(email, res);
  } else if (req.body.Usertype === "Student") {
    getStudentGroups(email, res);
  }
});

function getStudentGroups(email, res) {
  db.collection("groups")
    .find({ members: { $elemMatch: { email: email } } })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(result);
    });
}

function getTeachersGroups(email, res) {
  //console.log(email);
  db.collection("groups")
    .find({ "creator.email": email })
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(result);
    });
}

app.post("/createGroup", (req, res) => {
  //console.log(req.body);
  const creator = req.body.creator;
  const gName = req.body.GroupName;
  const pass = req.body.Password;
  const confirm = req.body.Confirm;
  const gimage = req.body.Image;

  if (pass === confirm) {
    bcrypt.hash(pass, saltRounds, (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        groupData = {
          groupName: gName,
          password: hash,
          creator: creator,
          members: [],
          content: [],
          image: gimage,
        };

        db.collection("groups")
          .insertOne(groupData)
          .then((result) => res.send({ message: "Success" }))
          .catch((e) => console.error(e));
      }
    });
  } else {
    res.send("Passwords do not match.");
  }
});

app.post("/groupInfo", (req, res) => {
  const id = ObjectId(req.body.ID);
  db.collection("groups")
    .findOne({ _id: id })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
});

app.post("/updateInfo", (req, res) => {
  const id = ObjectId(req.body.ID);
  const updatedName = req.body.Name;

  db.collection("groups")
    .updateOne({ _id: id }, { $set: { groupName: updatedName } })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
});

app.post("/updatePass", (req, res) => {
  const id = ObjectId(req.body.ID);
  const updatedPass = req.body.Pass;

  db.collection("groups")
    .updateOne({ _id: id }, { $set: { password: updatedPass } })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
});

app.get("/getGroups", (req, res) => {
  db.collection("groups")
    .find()
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(result);
    });
});

app.post("/searchGroups", (req, res) => {
  const searchId = req.body.searchData;
  const matchingGroups = [];

  db.collection("groups")
    .find()
    .toArray(function (err, result) {
      if (err) console.log(err);
      result.forEach((group) => {
        if (group._id.toString().includes(searchId) === true) {
          matchingGroups.push(group);
        }
      });
      res.send(matchingGroups);
    });
});

app.post("/joinGroup", (req, res) => {
  const id = ObjectId(req.body.group);
  // console.log(req.body.user);
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if ((err) => console.log(err));
  });
  db.collection("groups")
    .findOne({ _id: id })
    .then((result) => {
      bcrypt.compare(req.body.password, result.password, (err, response) => {
        if (response === true) {
          //console.log("test");
          addMember(req.body.user, id, res);
        } else {
          res.send({ message: "Incorrect password." });
          console.error(err);
        }
      });
    })
    .catch((e) => console.log(e));
});

function addMember(user, group, res) {
  db.collection("groups")
    .updateOne({ _id: group }, { $push: { members: user } })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
}

app.post("/deleteGroup", (req, res) => {
  const groupId = req.body.ID;
  const id = ObjectId(req.body.ID);
  const pass = req.body.Pass;

  db.collection("groups")
    .findOne({ _id: id })
    .then((result) => {
      bcrypt.compare(pass, result.password, (response, err) => {
        if (response) {
          //deleteItem(res, "groups", id);
          performDelete(id, groupId)
            .then((result) => res.send(result))
            .catch((e) => console.log(e));
        } else {
          res.send(err);
        }
      });
    })
    .catch((e) => console.error(e));
});

async function performDelete(id, groupId) {
  try {
    const groupDelete = await deleteSingle("groups", id);
    console.log(groupDelete);
    await deleteGroupItems("fileuploads", groupId);
    await deleteGroupItems("questions", groupId);
    await deleteGroupItems("quiz", groupId);
  } catch (e) {
    console.log(e);
  }
}

app.post("/deleteQuiz", (req, res) => {
  const id = ObjectId(req.body.qid);
  deleteItem(res, "quiz", id);
});

app.post("/checkProfanity", async (req, res) => {
  const body = req.body.textBody;
  const title = req.body.title;

  //console.log(title);

  if (profanityCheck.check(body) === false) {
    if (title === "undefined" && profanityCheck.check(title) === false) {
      pyProfanityCheck(res, body);
    }

    pyProfanityCheck(res, title, body);
  } else {
    const currDateTime = getCurrentDateTime();
    const userEmail = req.body.authorEmail;

    const profaneInfo = {
      profaneText: title + " " + body,
      dateTime: currDateTime,
      group: req.body.group,
    };

    updateOne(res, "users", userEmail, profaneInfo);
  }
});

app.post("/handleProfanity", (req, res) => {
  const userEmail = req.body.authorEmail;
  const currDateTime = getCurrentDateTime();
  const groupid = ObjectId(req.body.group);

  const profaneInfo = {
    questionTitle: req.body.title,
    questionBody: req.body.textBody,
    dateTime: currDateTime,
  };

  updateOne(res, "groups", groupid, userEmail, profaneInfo);
});

app.post("/postQuestion", (req, res) => {
  const currDateTime = getCurrentDateTime();

  // console.log(req.body)
  const questionData = {
    title: req.body.title,
    textBody: req.body.textBody,
    poster: req.body.author,
    posterId: req.body.authorEmail,
    dateTime: currDateTime,
    group: req.body.group,
    comments: [],
  };
  insertData(res, "questions", questionData);
});

app.post("/postComment", (req, res) => {
  const currDateTime = getCurrentDateTime();
  const qid = req.body.question;

  const commentData = [
    req.body.textBody,
    req.body.author,
    req.body.authorEmail,
    currDateTime,
    req.body.group,
  ];
  updateOneComment(res, "questions", qid, commentData);
});

app.post("/getQuestions", (req, res) => {
  const groupId = req.body.ID;
  findMany(res, "questions", groupId);
});

app.post("/getUpdated", (req, res) => {
  const qid = ObjectId(req.body.id);
  findSingle(res, "questions", qid);
});

app.post("/deleteQuestion", (req, res) => {
  const questionID = ObjectId(req.body.ID);
  deleteItem(res, "questions", questionID);
});

app.post("/createQuiz", (req, res) => {
  const quizdata = {
    title: req.body.title,
    type: req.body.type,
    start: req.body.start,
    end: req.body.end,
    questions: req.body.questions,
    group: req.body.groupid,
    results: [],
  };

  insertData(res, "quiz", quizdata);
});

app.post("/getQuiz", (req, res) => {
  const groupid = req.body.ID;
  findMany(res, "quiz", groupid);
});

app.post("/getSelectedQuiz", (req, res) => {
  const quizId = ObjectId(req.body.ID);
  findSingle(res, "quiz", quizId);
});

app.post("/updateGrade", (req, res) => {
  const quizid = ObjectId(req.body.qid);
  const uid = req.body.uid;
  const grade = req.body.grade;
  console.log(quizid)
  console.log(uid)
  updateGrade(quizid, "quiz", uid, grade, res);
});

function updateGrade(qid, collection, uid, grade, res) {
  try {
    db.collection(collection)
    .updateOne({_id: qid, "results.userEmail": uid}, {$set: {"results.$.grade" : grade}})
    .then((result) => res.send(result))
    .catch((e) => console.log(e))
  } catch (e) {
    console.log(e);
  }
}

app.post("/getContent", (req, res) => {
  const groupid = req.body.ID;
  findMany(res, "fileuploads", groupid);
});

app.post("/sendAnswers", (req, res) => {
  const qid = ObjectId(req.body.quiz);

  const answersData = {
    userFname: req.body.userFname,
    userSname: req.body.userSname,
    userEmail: req.body.userEmail,
    answers: req.body.answers,
    end: req.body.end,
    grade: req.body.grade,
  };
  updateQuiz(res, "quiz", qid, answersData);
});

app.post("/getChats", (req, res) => {
  const participantId = req.body.userid;
  //console.log(participantId)
  //console.log(req.body)
  findAllChats(res, "chats", participantId);
});

app.post("/getUpdatedChat", (req, res) => {
  const chatid = ObjectId(req.body.id);
  //console.log(participantId)
  findSingle(res, "chats", chatid);
});

app.post("/createChat", (req, res) => {
  const chatData = {
    participants: req.body.participants,
    messages: [],
  };
  insertData(res, "chats", chatData);
});

app.post("/sendMessage", (req, res) => {
  const date = new Date();
  const messageData = {
    _id: ObjectId,
    sender: req.body.sender,
    receiver: req.body.receiver,
    message: req.body.message,
    date:
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    time: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
  };
  const chat = ObjectId(req.body.chat);
  sendMessage(chat, messageData, res);
});

function findAllChats(res, collection, email) {
  try {
    db.collection(collection)
      .find({ participants: { $elemMatch: { email: email } } })
      .toArray(function (err, result) {
        if (err) res.send(err);
        res.send(result);
        //console.log(result);
      });
  } catch (e) {
    console.error(e);
  }
}

function sendMessage(chat, message, res) {
  db.collection("chats")
    .updateOne({ _id: chat }, { $push: { messages: message } })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
}

function pyProfanityCheck(res, title, body) {
  console.log(body);
  const python = spawn("python", ["checkProfanity.py", title, body]);
  python.stdout.on("data", function (data) {
    dataToSend = data.toString();
    res.send(dataToSend);
  });
  python.on("close", () => {
    console.log("Closed");
  });
}

function updateOne(res, collection, groupid, email, data) {
  try {
    db.collection(collection)
      .updateOne({ _id: groupid, "members.email" : email }, { $push: { "members.$.profanityMonitoring": data } })
      .then((result) => {
        res.send(result);
      })
      .catch((e) => {
        res.send(e);
      });
  } catch (e) {
    res.send(e);
  }
}

function updateQuiz(res, collection, qid, data) {
  try {
    db.collection(collection)
      .updateOne({ _id: qid }, { $push: { results: data } })
      .then((result) => {
        res.send(result);
      })
      .catch((e) => {
        res.send(e);
      });
  } catch (e) {
    res.send(e);
  }
}

function updateOneComment(res, collection, id, data) {
  const oid = ObjectId(id);
  try {
    db.collection(collection)
      .updateOne({ _id: oid }, { $push: { comments: [data] } })
      .then((result) => {
        res.send(result);
      })
      .catch((e) => {
        res.send(e);
      });
  } catch (e) {
    res.send(e);
  }
}

function insertData(res, collection, data) {
  try {
    db.collection(collection)
      .insertOne(data)
      .then((result) => res.send(result))
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
}

function findSingle(res, collection, data) {
  try {
    db.collection(collection)
      .findOne({ _id: data })
      .then((result) => {
        res.send(result);
      })
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
}

function findMany(res, collection, data) {
  try {
    db.collection(collection)
      .find({ group: data })
      .toArray(function (err, result) {
        if (err) res.send(err);
        res.send(result);
      });
  } catch (e) {
    res.send(e);
  }
}

function deleteItem(res, collection, data) {
  try {
    db.collection(collection)
      .deleteOne({ _id: data })
      .then((result) => res.send(result))
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
}

function deleteSingle(collection, data) {
  try {
    db.collection(collection)
      .deleteOne({ _id: data })
      .then((result) => {
        return result;
      })
      .catch((e) => {
        return e;
      });
  } catch (e) {
    {
      return e;
    }
  }
}

function deleteGroupItems(collection, data) {
  try {
    db.collection(collection)
      .deleteMany({ group: data })
      .then((result) => {
        return result;
      })
      .catch((e) => {
        return e;
      });
  } catch (e) {
    {
      return e;
    }
  }
}

function removeFile(res, id, file) {
  try {
    db.collection("fileuploads")
      .updateOne({ _id: id }, { $pull: { files: { filename: file } } })
      .then((result) => res.send(result))
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
}

function getCurrentDateTime() {
  const date = new Date();
  const currentDate =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  const currentTime =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  const currDateTime = currentDate + " " + currentTime;
  return currDateTime;
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
