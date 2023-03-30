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

const { ObjectId } = require("mongodb");
const { MongoClient } = require("mongodb");

const { spawn } = require("child_process");
const BadWordsNext = require("bad-words-next");
const en = require("bad-words-next/data/en.json");
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
    //console.log(id);
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

// function to insert new user into database
function registerUser(res, userData) {
  try {
    db.collection("users")
      .insertOne(userData)
      .then((result) => {
        res.send({ message: "Success" });
      })
      .catch((err) => {
        res.send({ message: "Error, account not registered." });
      });
  } catch (e) {
    console.log(e);
  }
}

// user registration routing method
// validates registration data
// validates password and password confirmation match
// hashes password
app.post(
  "/register",
  [
    body("Email").isLength({ min: 5, max: 80 }).isEmail(),
    body("Fname").isLength({ min: 1, max: 100 }),
    body("Sname").isLength({ min: 1, max: 100 }),
    body("Pass").isLength({ min: 8, max: 50 }),
    body("Confirm").isLength({ min: 8, max: 50 }),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      if (req.body.Pass != req.body.Confirm) {
        res.send({ message: "Passwords do not match" });
      } else {
        bcrypt.hash(req.body.Pass, saltRounds, (err, hash) => {
          if (err) {
            res.send(err);
          } else {
            continueRegistration(req.body, hash, res);
          }
        });
      }
    }
  }
);

// checks email does not already exist in database
// prepares data for to be stored
function continueRegistration(data, hash, res) {
  const check = async (email) => {
    const result = await checkEmail(email);
    if (result === null) {
      userData = {
        _id: data.Email,
        Fname: data.Fname,
        Sname: data.Sname,
        Pass: hash,
        UserType: data.UserType,
      };
      registerUser(res, userData);
    } else {
      res.send({ message: "Account with email already exists." });
    }
  };
  check(data.Email);
}

//middleware to check token in valid
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    res.send(false);
  } else {
    jwt.verify(token, "P1n3@ppl322$", (err, decoded) => {
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

// login endpoint
// validates data sent over request body
//
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
          if (result === null) {
            res.json({ message: "User does not exist." });
          } else {
            bcrypt.compare(pass, result.Pass, (err, response) => {
              if (response) {
                req.session.user = result;
                const token = jwt.sign({ email }, "P1n3@ppl322$", {
                  expiresIn: 86400,
                });
                res.json({ auth: true, token: token, result: result });
              } else {
                res.json({
                  auth: false,
                  message: "Wrong password",
                });
              }
            });
          }
        })
        .catch((err) => {
          res.send(err);
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

// check group end point
// gets the groups of each type of user
app.post("/checkGroup", (req, res) => {
  const email = req.body.Email;
  if (req.body.Usertype === "Teacher") {
    getTeachersGroups(email, res);
  } else if (req.body.Usertype === "Student") {
    getStudentGroups(email, res);
  }
});

function getStudentGroups(email, res) {
  try {
    db.collection("groups")
      .find({ members: { $elemMatch: { email: email } } })
      .toArray(function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
  } catch (e) {
    res.send(e);
  }
}

function getTeachersGroups(email, res) {
  try {
    db.collection("groups")
      .find({ "creator.email": email })
      .toArray(function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
  } catch (e) {
    res.send(e);
  }
}

// create group endpoint
app.post(
  "/createGroup",
  [
    body("creator").isLength({ min: 3, max: 100 }),
    body("GroupName").isLength({ max: 200 }),
    body("Password").isLength({ min: 8, max: 50 }),
    body("Confirm").isLength({ min: 8, max: 50 }),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const creator = req.body.creator;
      const gName = req.body.GroupName;
      const pass = req.body.Password;
      const confirm = req.body.Confirm;
      const gimage = req.body.Image;
      const description = req.body.description;

      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        console.log(validationErrors);
        res.status(400).json({ errors: validationErrors.array() });
      }
      if (pass === confirm) {
        bcrypt.hash(pass, saltRounds, (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            groupData = {
              groupName: gName,
              password: hash,
              creator: creator,
              description: description,
              members: [],
              image: gimage,
            };

            insertData(res, "groups", groupData);
          }
        });
      } else {
        res.send("Passwords do not match.");
      }
    }
  }
);

app.post("/groupInfo", (req, res) => {
  const id = ObjectId(req.body.ID);
  findSingle(res, "groups", id);
});

app.post("/updateInfo", (req, res) => {
  const id = ObjectId(req.body.ID);
  const updatedName = req.body.Name;

  try {
    db.collection("groups")
      .updateOne({ _id: id }, { $set: { groupName: updatedName } })
      .then((data) => res.send(data))
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
});

app.post("/updatePass", (req, res) => {
  const id = ObjectId(req.body.ID);
  const updatedPass = req.body.Pass;

  bcrypt.hash(updatedPass, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    } else {
      db.collection("groups")
        .updateOne({ _id: id }, { $set: { password: hash } })
        .then((data) => res.send(data))
        .catch((e) => res.send(e));
    }
  });
});

app.get("/getGroups", (req, res) => {
  db.collection("groups")
    .find()
    .toArray(function (err, result) {
      if (err) console.log(err);
      res.send(result);
    });
});

app.post(
  "/searchGroups",
  [body("searchData").isLength({ min: 0, max: 100 })],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
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
    }
  }
);

// endpoint to join group
app.post(
  "/joinGroup",
  [body("password").isLength({ min: 1, max: 100 })],
  (req, res) => {
    const id = ObjectId(req.body.group);

    const userData = {
      email: req.body.user.email,
      fname: req.body.user.fname,
      sname: req.body.user.sname,
      profanityMonitoring: [],
    };

    db.collection("groups")
      .findOne({ _id: id })
      .then((result) => {
        bcrypt.compare(req.body.password, result.password, (err, response) => {
          if (response === true) {
            addMember(userData, id, res);
          } else {
            console.error(err);
            res.send({ message: "Incorrect password." });
          }
        });
      })
      .catch((e) => console.log(e));
  }
);

function addMember(user, group, res) {
  db.collection("groups")
    .updateOne({ _id: group }, { $push: { members: user } })
    .then((data) => res.send(data))
    .catch((e) => res.send(e));
}

// endpoint to delete group
app.post(
  "/deleteGroup",
  [body("Pass").isLength({ min: 0, max: 100 })],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const groupId = req.body.ID;
      const id = ObjectId(req.body.ID);
      const pass = req.body.Pass;

      db.collection("groups")
        .findOne({ _id: id })
        .then((result) => {
          bcrypt.compare(pass, result.password, (err, response) => {
            if (response) {
              performDelete(id, groupId)
                .then((result) => res.send(result))
                .catch((e) => console.log(e));
            } else {
              res.send(err);
            }
          });
        })
        .catch((e) => console.error(e));
    }
  }
);

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

app.post(
  "/checkProfanity",
  [
    body("textBody").isLength({ min: 0, max: 200 }),
    body("title").isLength({ min: 0, max: 200 }),
  ],
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const body = req.body.textBody;
      const title = req.body.title;

      if (profanityCheck.check(body) === false) {
        if (title === undefined) {
          pyProfanityCheck(res, body);
        } else {
          if (profanityCheck.check(title) === true) {
            const data = [1];
            res.send(data);
          } else if (profanityCheck.check(title) === false) {
            pyProfanityCheck(res, title, body);
          }
        }
      } else {
        const data = [1];
        res.send(data);
      }
    }
  }
);

app.post("/handleProfanity", (req, res) => {
  const userEmail = req.body.authorEmail;
  const currDateTime = getCurrentDateTime();
  const groupid = ObjectId(req.body.group);

  const profaneInfo = {
    questionTitle: req.body.title,
    questionBody: req.body.textBody,
    dateTime: currDateTime,
  };

  updateProfanity(res, "groups", groupid, userEmail, profaneInfo);
});

app.post(
  "/postQuestion",
  [
    body("textBody").isLength({ min: 0, max: 200 }),
    body("title").isLength({ min: 0, max: 200 }),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const currDateTime = getCurrentDateTime();

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
    }
  }
);

app.post(
  "/postComment",
  [body("textBody").isLength({ min: 1, max: 200 })],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
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
    }
  }
);

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

app.post(
  "/createQuiz",
  [
    body("title").isLength({ min: 0, max: 200 }),
    body("type").notEmpty(),
    body("start").notEmpty(),
    body("end").notEmpty(),
    body("questions").notEmpty(),
  ],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors);
      res.status(400).json({ errors: validationErrors.array() });
    } else {
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
    }
  }
);

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
  updateGrade(quizid, "quiz", uid, grade, res);
});

function updateGrade(qid, collection, uid, grade, res) {
  try {
    db.collection(collection)
      .updateOne(
        { _id: qid, "results.userEmail": uid },
        { $set: { "results.$.grade": grade } }
      )
      .then((result) => res.send(result))
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

app.post("/releaseResults", (req, res) => {
  const quizid = ObjectId(req.body.ID);
  updateRelease(res, quizid);
});

function updateRelease(res, qid) {
  try {
    db.collection("quiz")
      .updateOne({ _id: qid }, { $set: { releaseResults: true } })
      .then((result) => res.send(result))
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
}

app.post("/getContent", (req, res) => {
  const groupid = req.body.ID;
  findMany(res, "fileuploads", groupid);
});

app.post("/sendAnswers", [body("answers").notEmpty()], (req, res) => {
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

app.post("/getAllChats", (req, res) => {
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

app.post(
  "/sendMessage",
  [body("textBody").isLength({ min: 0, max: 500 })],
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({ errors: validationErrors.array() });
    } else {
      const date = new Date();
      const messageData = {
        _id: ObjectId,
        sender: req.body.sender,
        receiver: req.body.receiver,
        message: req.body.textBody,
        date:
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate(),
        time:
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
      };
      const chat = ObjectId(req.body.chat);
      sendMessage(chat, messageData, res);
    }
  }
);

app.post("/getCurrentChat", (req, res) => {
  const chatId = ObjectId(req.body.chatid);

  findSingle(res, "chats", chatId);
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
  try {
    db.collection("chats")
      .updateOne({ _id: chat }, { $push: { messages: message } })
      .then((data) => res.send(data))
      .catch((e) => res.send(e));
  } catch (e) {
    res.send(e);
  }
}

function pyProfanityCheck(res, title, body) {
  //console.log(body);
  const python = spawn("python", ["checkProfanity.py", title, body]);
  python.stdout.on("data", function (data) {
    dataToSend = data.toString();
    res.send(dataToSend);
  });
  python.on("close", () => {
    console.log("Closed");
  });
}

function updateProfanity(res, collection, groupid, email, data) {
  try {
    db.collection(collection)
      .updateOne(
        { _id: groupid, "members.email": email },
        { $push: { "members.$.profanityMonitoring": data } }
      )
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
