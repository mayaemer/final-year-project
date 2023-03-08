import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import $ from "jquery";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Spinner from "react-bootstrap/Spinner";
import BackButton from "../components/BackButton";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { TextField } from "@mui/material";
import Refresh from "../components/Refresh";
import Alert from "@mui/material/Alert";
import Dropdown from "react-bootstrap/Dropdown";
import "../styles/Questions.css";

function Questions() {
  Axios.defaults.withCredentials = true;

  let { groupId } = useParams();

  const navigate = useNavigate();

  const [groupInfo, setGroupInfo] = useState([]);

  const [userInfo, setUserInfo] = useState([]);

  const [questions, setQuestions] = useState([]);

  const [comment, setComment] = useState({
    commentBody: "",
    questionId: "",
  });

  const [questionData, setQuestionData] = useState({
    questionTitle: "",
    questionBody: "",
  });

  const [addVisible, setAddVisible] = useState({
    questionForm: false,
    addBtn: true,
  });

  const [loading, setLoading] = useState(false);

  const [profanityError, setProfanityError] = useState(false);

  const getQuestions = () => {
    const data = {
      ID: groupId,
    };
    Axios.post("http://localhost:3001/getQuestions", data).then((res) => {
      setQuestions(res.data);
      console.log(res);
    });
  };

  function formatId(email) {
    let i;
    let formatEmail = [];
    let specialCharacters = [
      "!",
      '"',
      "#",
      "$",
      "%",
      "&",
      "'",
      "(",
      ")",
      "*",
      "+",
      ",",
      ".",
      "/",
      ":",
      ";",
      "<",
      "=",
      ">",
      "?",
      "@",
      "[",
      "]",
      "^",
      "`",
      "{",
      "|",
      "}",
      "~",
    ];
    for (i = 0; i < email.length; i++) {
      if (specialCharacters.includes(email[i])) {
        formatEmail.push("\\");
        formatEmail.push(email[i]);
      } else {
        formatEmail.push(email[i]);
      }
    }

    const formattedEmail = formatEmail.toString().split(",").join("");
    return formattedEmail;
  }

  const getGroupData = () => {
    const data = { ID: groupId };
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      $("#groupTitle").css("background-image", "url(" + res.data.image.image + ")");
      checkUser(res.data.members, res.data.creator);
    });
  };

  const checkUser = () => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setUserInfo(response.data);
        const email = response.data.user._id;
        const formattedEmail = formatId(email);
        const settingsId = "#" + formattedEmail;
        $(settingsId).show();
      }
    });
  };

  const handleVisibility = () => {
    setAddVisible({
      ...addVisible,
      questionForm: true,
      addBtn: false,
    });

    setProfanityError(false);
  };

  const handleChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setQuestionData({
      ...questionData,
      [key]: value,
    });
  };

  const submitQuestion = (e) => {
    e.preventDefault();
    const handleData = postQuestion;
    setLoading(true);
    handleVisibility();

    const data = {
      title: questionData.questionTitle,
      textBody: questionData.questionBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };
    setTimeout(() => checkProfanity(data, handleData), 1000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      const data = {
        poster: userInfo.user._id,
        textBody: comment.commentBody,
        group: groupInfo._id,
        questionId: comment.questionId,
      };

      console.log(data);
      const handleData = postComment;
      checkProfanity(data, handleData);
    }
  };

  const checkProfanity = (data, handleData) => {
    Axios.post("http://localhost:3001/checkProfanity", data)
      .then((result) => {
        if (result.data.includes(1)) {
          console.log(result.data);

          // const testFun = handleProfanity;
          // testFun();
          handleProfanity(data);
        } else {
          console.log(result.data);
          // postQuestion();
          handleData();
        }
      })
      .catch((e) => console.log(e));
  };

  const postQuestion = () => {
    const data = {
      title: questionData.questionTitle,
      textBody: questionData.questionBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };

    Axios.post("http://localhost:3001/postQuestion", data)
      .then((result) => {
        Refresh();
      })
      .catch((e) => console.log(e));
  };

  const postComment = async () => {
    const data = {
      textBody: comment.commentBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
      question: comment.questionId,
    };

    await Axios.post("http://localhost:3001/postComment", data)
      .then((result) => {
        console.log(result);
        Refresh();
      })
      .catch((e) => console.log(e));
  };

  const handleProfanity = (profaneData) => {
    console.log(profaneData);
    setLoading(false);

    setAddVisible({
      ...addVisible,
      questionForm: false,
      addBtn: true,
    });

    setProfanityError(true);

    const data = {
      title: questionData.questionTitle,
      textBody: profaneData.textBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };

    Axios.post("http://localhost:3001/handleProfanity", data)
      .then((result) => {
        console.log(result.data);
      })
      .catch((e) => console.log(e));
  };

  const handleEdit = (e) => {
    const questionid = e.target.name;
    const id = "#" + questionid;
    const questionClass = "." + questionid;

    $(id).hide();
    $(questionClass).show();
  };

  const handleDelete = (e) => {
    const questionId = e.target.name;
    const data = {
      ID: questionId,
    };
    Axios.post("http://localhost:3001/deleteQuestion", data)
      .then((result) => {
        console.log(result);
        Refresh();
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/isAuthenticated", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      const authenticated = response.data;
      if (authenticated === true) {
        navigate("/Questions/" + groupId);
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          getGroupData();
          getQuestions();
        }
      }, 0);

      return () => {
        unmounted = true;
      };
    }, []);
  }, []);

  return (
    <div>
      <div id="groupTitle">
        <h1 id="groupHeader">{groupInfo.groupName}</h1>
      </div>
      <BackButton destination={"group/" + groupId}></BackButton>
      <h3>Questions</h3>
      <Grid lg={12} item container spacing={2} id="main">
        <Grid item lg={3} md={3} xs={12}>
          <Card id="groupCard">
            <MenuList>
              <h4>Categories</h4>
              {questions.map((title) => (
                <MenuItem>{title.title}</MenuItem>
              ))}
            </MenuList>
          </Card>
        </Grid>
        <Grid item lg={9} md={9} xs={12}>
          {addVisible.addBtn && (
            <Fab name="questionForm" onClick={handleVisibility}>
              <AddIcon name="questionForm"></AddIcon>
            </Fab>
          )}

          {loading && (
            <div>
              <p>Posting question..</p>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Posting...</span>
              </Spinner>
            </div>
          )}

          {profanityError && (
            <Alert severity="error">
              Profanity detected. Question will not be posted.
            </Alert>
          )}

          {addVisible.questionForm && (
            <Card>
              <form onSubmit={submitQuestion}>
                <TextField
                  id="outlined-basic"
                  label="Question Title"
                  variant="outlined"
                  name="questionTitle"
                  onChange={handleChange}
                />
                <TextField
                  id="outlined-password-input"
                  label="Question Body"
                  type="outlined"
                  name="questionBody"
                  onChange={handleChange}
                />
                <button type="submit">Create</button>
              </form>
            </Card>
          )}

          {questions.map((question) => (
            <div>
              <Card id="questionCard">
                <div id={question._id}>
                  <h4>{question.title}</h4>
                  <div id={question.posterId} className="questionSettings">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        id="dropdown-basic"
                      ></Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item name={question._id} onClick={handleEdit}>
                          Edit Post
                        </Dropdown.Item>
                        <Dropdown.Item
                          name={question._id}
                          onClick={handleDelete}
                        >
                          Delete Post
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <hr></hr>
                  <p>{question.textBody}</p>
                  <p>{question.poster}</p>
                  <p>{question.dateTime}</p>
                </div>
                <div id="editForm" class={question._id}>
                  <form onSubmit={submitQuestion}>
                    <TextField
                      id="outlined-multiline-flexible"
                      multiline
                      maxRows={4}
                      defaultValue={question.questionTitle}
                      onChange={handleChange}
                    />
                    <TextField
                      id="outlined-multiline-flexible"
                      multiline
                      maxRows={4}
                      defaultValue={question.questionBody}
                      onChange={handleChange}
                    />
                    <button type="submit">Save</button>
                  </form>
                </div>
                <div>
                  <hr></hr>
                  <h6>Comments</h6>

                  {question.comments.map((comment) => (
                    <div id="commentSec">
                      <p id='commenter'>{comment[0][1]}</p>
                      <p>{comment[0][0]}</p>
                      <p>{comment[0][3]}</p>
                    </div>
                  ))}
                  <form>
                    <TextField
                      id="filled-multiline-flexible"
                      multiline
                      placeholder="Write a comment.."
                      maxRows={4}
                      variant="filled"
                      name={question._id}
                      onChange={(e) =>
                        setComment({
                          ...comment,
                          commentBody: e.target.value,
                          questionId: e.target.name,
                        })
                      }
                      onKeyDown={handleKey}
                    />
                  </form>
                </div>
              </Card>
            </div>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}

export default Questions;
