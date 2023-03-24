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
import {
  postCommenSchema,
  postQuestionSchema,
} from "../Validations/Validation";
import AddIcon from "@mui/icons-material/Add";
import { Button, IconButton, TextField } from "@mui/material";
import Refresh from "../components/Refresh";
import Alert from "@mui/material/Alert";
import Dropdown from "react-bootstrap/Dropdown";
import "../styles/Questions.css";
import { Send } from "@mui/icons-material";

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
    noQuestions: false,
    showQuestions: false,
    loading: false,
    profanityError: false,
    validationError: false,
    op: false,
  });

  const [selectedQuestion, setSelectedQuestion] = useState();

  const [editArr, setEditArr] = useState([]);

  const getQuestions = (userData) => {
    const data = {
      ID: groupId,
    };
    Axios.post("http://localhost:3001/getQuestions", data).then((res) => {
      if (res.data.length > 0) {
        setQuestions(res.data);
        const i = res.data.length - 1;
        setSelectedQuestion(res.data[i]);
        if (res.data[i]["posterId"] === userData.user._id) {
          setAddVisible({
            ...addVisible,
            op: true,
            showQuestions: true,
          });
        } else {
          setAddVisible({
            ...addVisible,
            op: false,
            showQuestions: true,
          });
        }
      } else if (res.data.length === 0) {
        setAddVisible({
          ...addVisible,
          noQuestions: true,
        });
      }
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
    console.log(data);
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      $("#groupTitle").css(
        "background-image",
        "url(" + res.data.image.image + ")"
      );
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
        getQuestions(response.data);
      }
    });
  };

  const handleVisibility = () => {
    setAddVisible({
      ...addVisible,
      questionForm: true,
      addBtn: false,
      showQuestions: false,
      noQuestions: false,
    });
  };

  const closeForm = () => {
    if (questions.length === 0) {
      setAddVisible({
        ...addVisible,
        questionForm: false,
        addBtn: true,
        showQuestions: false,
        noQuestions: true,
        profanityError: false,
      });
    } else if (questions.length > 0) {
      setAddVisible({
        ...addVisible,
        questionForm: false,
        addBtn: true,
        showQuestions: true,
        noQuestions: false,
        profanityError: false,
      });
    }
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
    setAddVisible({
      ...addVisible,
      loading: true,
      questionForm: false,
      showQuestions: false,
      noQuestions: false,
    });

    const data = {
      title: questionData.questionTitle,
      textBody: questionData.questionBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };
    setTimeout(() => checkProfanity(data, handleData), 1000);
  };

  const handleKey = () => {
    const data = {
      poster: userInfo.user._id,
      textBody: comment.commentBody,
      group: groupInfo._id,
      questionId: comment.questionId,
    };

    //console.log(data);
    const handleData = postComment;
    checkProfanity(data, handleData);
  };

  const checkProfanity = (data, handleData) => {
    Axios.post("http://localhost:3001/checkProfanity", data)
      .then((result) => {
        console.log(data)
        if (result.data.includes(1)) {
          //console.log(result);

          handleProfanity(data);
        } else {
          console.log(result);
          // postQuestion();
          handleData();
        }
      })
      .catch((e) => console.log(e));
  };

  const postQuestion = async () => {
    const data = {
      title: questionData.questionTitle,
      textBody: questionData.questionBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };

    const validate = await postQuestionSchema.isValid(data);

    if (validate === true) {
      try {
        Axios.post("http://localhost:3001/postQuestion", data)
          .then((result) => {
            Refresh();
          })
          .catch((e) => console.log(e));
      } catch (e) {
        console.log(e);
      }
    } else {
      setAddVisible({
        ...addVisible,
        validationError: true,
      });
    }
  };

  const postComment = async () => {
    const data = {
      textBody: comment.commentBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
      question: comment.questionId,
    };

    const validate = await postCommenSchema.isValid(data);
    if (validate === true) {
      try {
        Axios.post("http://localhost:3001/postComment", data)
          .then((result) => {
            console.log(result);
            getUpdated();
            setComment({
              commentBody: "",
            });
          })
          .catch((e) => console.log(e));
      } catch (e) {
        console.error(e);
      }
    } else {
      setAddVisible({
        ...addVisible,
        validationError: true,
      });
    }
  };

  const closeError = () => {
    setAddVisible({
      ...addVisible,
      questionForm: true,
      validationError: false,
    });
  };

  const getUpdated = () => {
    const data = {
      id: selectedQuestion._id,
    };
    Axios.post("http://localhost:3001/getUpdated", data)
      .then((result) => {
        console.log(result);
        setSelectedQuestion(result.data);
        if (result.data.posterId === userInfo.email) {
          setAddVisible({
            ...addVisible,
            op: true,
          });
        } else {
          setAddVisible({
            ...addVisible,
            op: false,
          });
        }
      })
      .catch((e) => console.log(e));
  };

  const handleProfanity = (profaneData) => {

    setAddVisible({
      ...addVisible,
      loading: false,
      noQuestions: false,
      showQuestions: false,
      questionForm: false,
      addBtn: true,
      profanityError: true,
    });

    const data = {
      title: questionData.questionTitle,
      textBody: profaneData.textBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };

    Axios.post("http://localhost:3001/handleProfanity", data)
      .then((result) => {
        console.log(result);
      })
      .catch((e) => console.log(e));
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

  const showSelected = (e) => {
    const selectedItem = e.target.id;
    console.log(selectedQuestion);
    questions.forEach((question) => {
      if (question._id === selectedItem) {
        setSelectedQuestion(question);
        if (question.posterId === userInfo.email) {
          setAddVisible({
            ...addVisible,
            op: true,
          });
        } else {
          setAddVisible({
            ...addVisible,
            op: false,
          });
        }
      }
    });
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
        }
      }, 0);

      return () => {
        unmounted = true;
      };
    }, []);
  }, []);

  return (
    <Grid>
      <Grid id="groupTitle">
        <h1 id="groupHeader">{groupInfo.groupName}</h1>
      </Grid>
      <Grid>
        <Card id="groupCard">
          <Grid lg={12} item container spacing={2} id="main">
            <Grid item lg={12} md={12} xs={12}>
              <h3 id="header">Questions</h3>
            </Grid>
            <Grid item lg={1} md={1} xs={1} id="btnSection">
              <BackButton destination={"group/" + groupId}></BackButton>
            </Grid>
            <Grid item lg={1} md={1} xs={1} id="btnSection">
              {addVisible.addBtn && (
                <IconButton name="questionForm" onClick={handleVisibility}>
                  <AddIcon name="questionForm"></AddIcon>
                </IconButton>
              )}
            </Grid>
            <Grid item lg={10} md={10} xs={10}></Grid>
            {addVisible.showQuestions && (
              <Grid item lg={4} md={4} xs={12} id="menuSection">
                <MenuList id="menu">
                  {questions.map((title) => (
                    <MenuItem
                      id={title._id}
                      onClick={showSelected}
                      style={{
                        backgroundColor:
                          selectedQuestion._id === title._id
                            ? "#bdbebf"
                            : "#edeff2",
                        cursor: "pointer",
                      }}
                    >
                      {title.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </Grid>
            )}

            {addVisible.noQuestions && (
              <Grid item lg={12} md={12} xs={12}>
                <p>No questions have been posted.</p>
              </Grid>
            )}

            {addVisible.loading && (
              <Grid item lg={12} md={12} xs={12}>
                <p>Posting question..</p>
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Posting...</span>
                </Spinner>
              </Grid>
            )}

            {addVisible.profanityError && (
              <Grid item lg={12} md={12} xs={12}>
                <Alert severity="error">
                  Profanity detected. Question will not be posted.
                  <Button variant="outlined" onClick={closeForm}>
                    Ok
                  </Button>
                </Alert>
              </Grid>
            )}

            {addVisible.questionForm && (
              <Grid item lg={12} md={12} xs={12} id="edit">
                <Grid item lg={12} md={12} xs={12}>
                  <h5>Post Question</h5>
                </Grid>

                {addVisible.validationError && (
                  <Grid item lg={12} md={12} xs={12} id="validationError">
                    <Alert severity="error">
                      Invalid input. All fields are required, maximum of 1000
                      words.
                      <Button variant="outlined" onClick={closeError}>
                        OK
                      </Button>
                    </Alert>
                  </Grid>
                )}
                <form onSubmit={submitQuestion}>
                  <Grid item lg={12} md={12} xs={12} id="edititemText">
                    <TextField
                      fullWidth
                      label="Question Title"
                      variant="outlined"
                      name="questionTitle"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item lg={12} md={12} xs={12} id="edititemText">
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Question Body"
                      type="outlined"
                      name="questionBody"
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item lg={12} md={12} xs={12}>
                    <Button id="edititem" variant="outlined" type="submit">
                      Create
                    </Button>
                    <Button
                      id="edititem"
                      variant="outlined"
                      onClick={closeForm}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </form>
              </Grid>
            )}

            {addVisible.showQuestions && (
              <Grid container lg={8} md={8} xs={12} id="question">
                <Grid item lg={12} md={12} xs={12}>
                  <h2 id="heading">{selectedQuestion.title}</h2>

                  <Grid item lg={1} md={1} xs={2} id="dropdown">
                    {addVisible.op && (
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          id="dropdown-basic"
                        ></Dropdown.Toggle>

                        <Dropdown.Menu>
                          {/* <Dropdown.Item name={question._id} onClick={handleEdit}>
                          Edit Post
                        </Dropdown.Item> */}
                          <Dropdown.Item
                            name={selectedQuestion._id}
                            onClick={handleDelete}
                          >
                            Delete Post
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </Grid>

                  <Grid item lg={12} md={12} xs={12} id="subheading">
                    <p id="dateTimeQuestion">
                      {selectedQuestion.poster} posted at{" "}
                      {selectedQuestion.dateTime}
                    </p>
                  </Grid>

                  <Grid item lg={12} md={12} xs={12}>
                    <p id="questionBody">{selectedQuestion.textBody}</p>
                  </Grid>
                </Grid>
                {editArr.includes(selectedQuestion._id) && (
                  <div id="editForm" class={selectedQuestion._id}>
                    <form onSubmit={submitQuestion}>
                      <TextField
                        id="outlined-multiline-flexible"
                        multiline
                        maxRows={4}
                        defaultValue={selectedQuestion.questionTitle}
                        onChange={handleChange}
                      />
                      <TextField
                        id="outlined-multiline-flexible"
                        multiline
                        maxRows={4}
                        defaultValue={selectedQuestion.questionBody}
                        onChange={handleChange}
                      />
                      <button type="submit">Save</button>
                    </form>
                  </div>
                )}

                <Grid item lg={12} md={12} xs={12} id="commentSection">
                  <form>
                    <TextField
                      id="filled-multiline-flexible"
                      multiline
                      placeholder="Write a comment.."
                      maxRows={4}
                      fullWidth
                      variant="filled"
                      value={comment.commentBody}
                      name={selectedQuestion._id}
                      onChange={(e) =>
                        setComment({
                          ...comment,
                          commentBody: e.target.value,
                          questionId: e.target.name,
                        })
                      }
                    />
                    <IconButton id="sendBtn" onClick={handleKey}>
                      <Send />
                    </IconButton>
                  </form>
                  {selectedQuestion.comments.map((comment) => (
                    <Grid item lg={12} md={12} xs={12} id="comment">
                      <p id="commenter">{comment[0][1]}</p>
                      <p id="dateTime">{comment[0][3]}</p>
                      <p id="textBody">{comment[0][0]}</p>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Questions;
