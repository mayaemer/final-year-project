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
    });
  };

  const getGroupData = () => {
    const data = { ID: groupId };
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      $("#groupTitle").css("background-image", "url(" + res.data.image + ")");
      checkUser(res.data.members, res.data.creator);
    });
  };

  const checkUser = () => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setUserInfo(response.data);
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

    setLoading(true);
    handleVisibility();

    const data = {
      title: questionData.questionTitle,
      questionBody: questionData.questionBody,
      author: userInfo.user.Fname + " " + userInfo.user.Sname,
      authorEmail: userInfo.user._id,
      group: groupInfo._id,
    };
    setTimeout(() => checkProfanity(data), 1000);
  };

  const checkProfanity = (data) => {
    Axios.post("http://localhost:3001/checkProfanity", data)
      .then((result) => {
        if (result.data.includes(1)) {
          console.log(result.data);
          handleProfanity();
        } else {
          console.log(result.data);
          postQuestion();
        }
      })
      .catch((e) => console.log(e));
  };

  const postQuestion = () => {
    const data = {
      title: questionData.questionTitle,
      questionBody: questionData.questionBody,
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

  const handleProfanity = () => {
    setLoading(false);

    setAddVisible({
      ...addVisible,
      questionForm: false,
      addBtn: true,
    });

    setProfanityError(true);

    const data = {
      title: questionData.questionTitle,
      questionBody: questionData.questionBody,
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
                <MenuItem>{title.questionTitle}</MenuItem>
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
              <Card id={question._id}>
                <h4>{question.questionTitle}</h4>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                  ></Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item name={question._id} onClick={handleEdit}>
                      Edit Post
                    </Dropdown.Item>
                    <Dropdown.Item name={question._id} onClick={handleDelete}>
                      Delete Post
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <hr></hr>
                <p>{question.questionBody}</p>
                <p>{question.poster}</p>
                <p>{question.dateTime}</p>
              </Card>
              <Card id="editForm" class={question._id}>
                <form onSubmit={submitQuestion}>
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    name="questionTitle"
                    onChange={handleChange}
                    value={question.questionTitle}
                  />
                  <TextField
                    id="outlined-password-input"
                    type="outlined"
                    name="questionBody"
                    value={question.questionBody}
                    onChange={handleChange}
                  />
                  <button type="submit">Save</button>
                </form>
              </Card>
            </div>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}

export default Questions;
