import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import $ from "jquery";
import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import BackButton from "../components/BackButton";
import { TextField } from "@mui/material";
import "../styles/Quiz.css";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import RemoveIcon from "@mui/icons-material/Remove";
import SettingsIcon from "@mui/icons-material/Settings";
import Spinner from "react-bootstrap/Spinner";
import Refresh from "../components/Refresh";
import Grid from "@mui/material/Grid";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import { GripVertical } from "react-bootstrap-icons";

function Quiz() {
  Axios.defaults.withCredentials = true;

  let { groupId } = useParams();

  const navigate = useNavigate();

  const [groupInfo, setGroupInfo] = useState([]);

  const [accountEmail, setAccountEmail] = useState("");

  const [quizArray, setQuizArray] = useState([]);

  const [buttonVisibility, setButtonVisibility] = useState({
    add: false,
    remove: false,
  });

  const [quizDisplay, setQuizDisplay] = useState({
    main: true,
    none: false,
    quizSelection: false,
    confirmDelete: false,
    deleteInProgress: false,
    deleteSection: false,
    table: true,
  });

  const [view, setView] = useState({
    teacher: false,
    student: false,
  });

  const [createForm, setCreateForm] = useState({
    main: false,
    first: false,
    mcq: false,
    text: false,
    tf: false,
    savedQuestions: true,
    loading: false,
    editQuestion: false,
  });

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizType, setQuizType] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questionsArray, setQuestionsArray] = useState([1]);
  const [mcq, setMcq] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([
    { id: "a" },
    { id: "b" },
    { id: "c" },
    { id: "d" },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [editQuestion, setEditQuestion] = useState();
  const [answerInput, setAnswerInput] = useState(["a", "b", "c", "d"]);
  const [deleteQuiz, setDeleteQuiz] = useState();

  const quizOptions = [
    {
      value: "MCQ",
      label: "Multiple Choice Questions",
    },
    {
      value: "Text",
      label: "Text Questions",
    },
  ];

  const getGroupData = () => {
    const data = { ID: groupId };
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      $("#groupTitle").css(
        "background-image",
        "url(" + res.data.image.image + ")"
      );
      checkUser(res.data.members, res.data.creator);
    });
  };

  const getQuiz = (userEmail) => {
    const data = {
      ID: groupId,
    };
    Axios.post("http://localhost:3001/getQuiz", data).then((res) => {
      if (res.data.length === 0) {
        setQuizDisplay({
          ...quizDisplay,
          none: true,
          quizSelection: false,
        });
      }
      checkCompletionStatus(res.data, userEmail);
    });
  };

  const checkCompletionStatus = (data, email) => {
    const quizParticipants = [];
    const quizDataCompletionArr = [];
    data.forEach((quiz) => {
      if (quiz.results.length === 0) {
        quiz.userCompletion = "Incomplete";
        quizDataCompletionArr.push(quiz);
      } else {
        quiz.results.forEach((result) => {
          quizParticipants.push(result[0].userEmail);
        });
        if (quizParticipants.includes(email) === true) {
          quiz.userCompletion = "Complete";
          quizDataCompletionArr.push(quiz);
        } else {
          console.log(quiz);
          quiz.userCompletion = "Incomplete";
          quizDataCompletionArr.push(quiz);
        }
      }
    });
    setQuizArray(quizDataCompletionArr);
    setQuizDisplay({
      ...quizDisplay,
      quizSelection: true,
    });
  };

  const openForm = () => {
    setCreateForm({
      ...createForm,
      main: true,
      first: true,
    });
    setButtonVisibility({
      ...buttonVisibility,
      add: false,
      remove: true,
    });
    setQuizDisplay(false);
  };

  const closeForm = () => {
    setCreateForm({
      ...createForm,
      main: false,
      first: false,
      mcq: false,
      text: false,
      tf: false,
    });
    setButtonVisibility({
      ...buttonVisibility,
      add: true,
      remove: false,
    });
    setQuizDisplay(true);
  };

  const checkUser = (members, creator) => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setAccountEmail(response.data.user._id);
        const accountEmail = response.data.user._id;
        getQuiz(accountEmail);
        if (
          creator === accountEmail ||
          members.includes(accountEmail) === true
        ) {
          checkUserType(response.data.user.UserType, creator, accountEmail);
        } else {
          navigate("/group/" + groupId);
        }
      }
    });
  };

  const checkUserType = async (usertype, creator, email) => {
    if (usertype === "Teacher" && creator === email) {
      setButtonVisibility({
        ...buttonVisibility,
        add: true,
        remove: false,
      });
      setView({
        ...view,
        teacher: true,
      });
    } else if (usertype === "Student") {
      setButtonVisibility({
        ...buttonVisibility,
        add: false,
        remove: false,
      });
      setView({
        ...view,
        student: true,
      });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (quizType === "MCQ") {
      setCreateForm({
        ...createForm,
        first: false,
        mcq: true,
      });
    } else if (quizType === "Text") {
      setCreateForm({
        ...createForm,
        first: false,
        text: true,
      });
    } else {
      console.error("Error");
    }

    setButtonVisibility({
      add: false,
      remove: true,
    });
  };

  const addQuestion = () => {
    setAnswerInput(["a", "b", "c", "d"]);
    setCreateForm({
      ...createForm,
      edit: false,
    });
    setEditQuestion();
    const num = questionsArray.length;
    setQuestionsArray([...questionsArray, parseInt(num) + 1]);
    saveQuestion(currentQuestion);

    const hideId = "#" + currentQuestion;
    $(hideId).hide();
    console.log(hideId);
    setCurrentQuestion(parseInt(num) + 1);
  };

  const handleQuestionChange = (e) => {
    if (e.target.id === "question") {
      setQuestion(e.target.value);
    } else if (e.target.id === "answer") {
      const answerOption = e.target.name;
      const answerToSet = answers.find((a) => a.id === answerOption);
      answerToSet.answer = e.target.value;
    }
  };

  const handleEditQuestion = (e) => {
    saveQuestion(currentQuestion);
    const id = parseInt(e.currentTarget.id);
    setCurrentQuestion(id);
    setCreateForm({
      ...createForm,
      mcq: false,
      edit: true,
    });

    const setQuestion = mcq.find((q) => q.id === id);
    setEditQuestion(setQuestion);
  };

  const saveQuestion = (id) => {
    const setMcqQuestion = mcq.find((q) => q.id === id);
    if (setMcqQuestion != undefined) {
      setMcqQuestion.question = question;
      setMcqQuestion.answers = answers;
      resetQAstates();
    } else {
      setMcq([
        ...mcq,
        {
          id: id,
          question: question,
          answers: answers,
        },
      ]);
      resetQAstates();
    }
  };

  const resetQAstates = () => {
    setQuestion("");
    setAnswers([{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }]);
  };

  const mcqAnswers = (e) => {
    const qid = e.target.name;
    const aid = e.target.id;
    const setQuestion = correctAnswers.find((q) => q.qid === qid);
    //console.log(aid);
    if (setQuestion === undefined) {
      setCorrectAnswers([
        ...correctAnswers,
        {
          qid: qid,
          aid: [aid],
        },
      ]);
    } else if (setQuestion != undefined) {
      if (setQuestion.aid.includes(aid) === true) {
        for (let i = 0; i < setQuestion.aid.length; i++) {
          if (setQuestion.aid[i] === aid) {
            setQuestion.aid[i] = "undefined";
          }
        }
      } else if (setQuestion.aid != aid) {
        // add new item to existing array
        setQuestion.aid = [...setQuestion.aid, aid];
      }
    }
  };

  const filterUndefined = () => {
    let correctItemArray = [];

    correctAnswers.map((qa) => {
      let correctAnswerItem = qa;
      const filteredAid = correctAnswerItem.aid.filter(
        (item) => item != "undefined"
      );
      let answerObject = {
        qid: qa.qid,
        aid: filteredAid,
      };

      correctItemArray.push(answerObject);
    });

    return correctItemArray;
  };

  const removeAnswer = (e) => {
    // when not returning id currentTarget
    const answerId = e.currentTarget.id;
    const filtered = answers.filter((ans) => ans.id != answerId);
    setAnswers(filtered);
    const removedElement = answerInput.filter((item) => item !== answerId);
    setAnswerInput(removedElement);
  };

  const saveMcq = () => {
    const correctAnswers = filterUndefined();
    const quizdata = {
      title: quizTitle,
      type: quizType,
      start: startDate,
      end: endDate,
      questions: mcq,
      groupid: groupInfo._id,
      correctAns: correctAnswers,
    };

    postQuiz(quizdata);
  };

  const postQuiz = async (quizData) => {
    setCreateForm({
      mcq: false,
      savedQuestions: false,
      loading: true,
    });
    setTimeout(
      await Axios.post("http://localhost:3001/createQuiz", quizData)
        .then((response) => {
          console.log(response);
          Refresh();
        })
        .catch((e) => console.error(e)),
      2000
    );
  };

  const confirmDelete = (e) => {
    const selectedQuiz = e.currentTarget.id;
    //console.log(selectedQuiz);
    setQuizDisplay({
      ...quizDisplay,
      table: false,
      deleteSection: true,
      confirmDelete: true,
    });
    quizArray.forEach((quiz) => {
      if (quiz._id === selectedQuiz) {
        setDeleteQuiz(quiz);
      }
    });
  };

  const handleDeleteQuiz = () => {
    const data = {
      qid: deleteQuiz._id,
    };
    setQuizDisplay({
      ...quizDisplay,
      confirmDelete: false,
      deleteInProgress: true,
    });
    setTimeout(
      Axios.post("http://localhost:3001/deleteQuiz", data)
        .then((response) => {
          console.log(response);
          Refresh();
        })
        .catch((e) => console.error(e)),
      2000
    );
  };

  const cancelDelete = () => {
    setQuizDisplay({
      ...quizDisplay,
      confirmDelete: false,
      table: true,
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
        navigate("/Quiz/" + groupId);
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          getGroupData();
          getQuiz();
        }
      }, 0);

      return () => {
        unmounted = true;
      };
    }, []);
  }, []);

  const testt = () => {
    console.log(quizArray);
  };

  return (
    <div>
      <div id="groupTitle">
        <h1 id="groupHeader">{groupInfo.groupName}</h1>
      </div>
      <button onClick={testt}>test</button>
      <BackButton destination={"group/" + groupId}></BackButton>
      <h3>Quizzes</h3>
      {buttonVisibility.add && (
        <IconButton aria-label="addGroup" onClick={openForm}>
          <AddIcon />
        </IconButton>
      )}
      {buttonVisibility.remove && (
        <IconButton aria-label="addGroup" onClick={closeForm}>
          <RemoveIcon />
        </IconButton>
      )}

      {quizDisplay.main && (
        <Card>
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              {quizDisplay.deleteSection && (
                <Grid>
                  {quizDisplay.confirmDelete && (
                    <Grid>
                      <p>
                        Please confirm you wish to delete the '
                        {deleteQuiz.title}' quiz.
                      </p>
                      <Button variant="outlined" onClick={handleDeleteQuiz}>
                        Confirm Delete
                      </Button>
                      <Button variant="outlined" onClick={cancelDelete}>
                        Cancel
                      </Button>
                    </Grid>
                  )}
                  {quizDisplay.deleteInProgress && (
                    <Grid>
                      <p>Deleting quiz..</p>
                      <Spinner></Spinner>
                    </Grid>
                  )}
                </Grid>
              )}
              {quizDisplay.table && (
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Quizzes</th>
                      {view.student && <th>Completion Status</th>}
                    </tr>
                  </thead>
                  {quizDisplay.none && <tr>No quizzes available.</tr>}

                  {quizDisplay.quizSelection && (
                    <tbody>
                      {quizArray.map((quiz) => (
                        <tr>
                          <td>
                            <Link to={"/Quiz/" + groupId + "/" + quiz._id}>
                              {quiz.title}
                            </Link>
                            <p>Starts {quiz.start}</p>
                            <p>Ends {quiz.end}</p>
                          </td>
                          {view.student && (
                            <td>
                              <p>{quiz.userCompletion}</p>
                            </td>
                          )}
                          {view.teacher && <td>
                            <IconButton id={quiz._id}>
                              <Delete id={quiz._id} onClick={confirmDelete} />
                            </IconButton>
                          </td>}
                        </tr>
                      ))}
                    </tbody>
                  )}
                </Table>
              )}
            </Grid>
          </Grid>
        </Card>
      )}

      {createForm.loading && (
        <div>
          <p>Creating quiz..</p>
          <Spinner></Spinner>
        </div>
      )}

      {createForm.main && (
        <Card id="createForm">
          <Grid container spacing={2}>
            <Grid lg={12} md={12} xs={12}>
              <h4>Create Quiz</h4>
              <hr />
            </Grid>

            {createForm.first && (
              <Grid lg={12} md={12} xs={12}>
                <form onSubmit={handleNext}>
                  <Grid lg={12} md={12} xs={12}>
                    <TextField
                      id="outlined-basic"
                      label="Quiz Title"
                      variant="outlined"
                      onChange={(e) => setQuizTitle(e.target.value)}
                    />
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    <TextField
                      id="outlined-select-usertype"
                      select
                      label="Select"
                      defaultValue=""
                      helperText="Please select the quiz type"
                      onChange={(e) => setQuizType(e.target.value)}
                    >
                      {quizOptions.map((quiz) => (
                        <MenuItem key={quiz.value} value={quiz.value}>
                          {quiz.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    <TextField
                      id="datetime-local"
                      label="Start date and time"
                      type="datetime-local"
                      onChange={(e) => setStartDate(e.target.value)}
                      sx={{ width: 250 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    <TextField
                      id="datetime-local"
                      label="End date and time"
                      type="datetime-local"
                      onChange={(e) => setEndDate(e.target.value)}
                      sx={{ width: 250 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Button variant="outlined" type="submit">
                    Next
                  </Button>
                </form>
              </Grid>
            )}

            {createForm.edit && (
              <Grid lg={12} md={12} xs={12}>
                <form id={editQuestion.id} className="questionForm">
                  <Grid lg={12} md={12} xs={12}>
                    <p>Question {editQuestion.id}</p>
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    <Button onClick={addQuestion}>
                      <AddIcon />
                    </Button>
                    <Button>
                      <SettingsIcon />
                    </Button>
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    <TextField
                      sx={{
                        width: { sm: 300, md: 800 },
                      }}
                      id="question"
                      defaultValue={editQuestion.question}
                      variant="outlined"
                      onChange={handleQuestionChange}
                    />
                  </Grid>
                  {editQuestion.answers.map((ans) => (
                    <Grid lg={12} md={12} xs={12}>
                      <Checkbox
                        id={ans.id}
                        name={question}
                        onClick={mcqAnswers}
                      ></Checkbox>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 600 },
                        }}
                        id="answer"
                        defaultValue={ans.answer}
                        variant="outlined"
                        name={ans.id}
                        onChange={handleQuestionChange}
                      />
                    </Grid>
                  ))}
                </form>
                <Button variant="outlined" onClick={saveMcq}>
                  Save
                </Button>
              </Grid>
            )}

            {createForm.savedQuestions && (
              <Grid lg={12} md={12} xs={12}>
                {mcq.map((q) => (
                  <Grid
                    id={q.id}
                    className="savedQuestion"
                    onClick={handleEditQuestion}
                  >
                    <p>Question {q.id}</p>
                    <p>{q.question}</p>
                    {q.answers.map((ans) => (
                      <div>
                        <p>
                          {ans.id}. {ans.answer}
                        </p>
                      </div>
                    ))}
                  </Grid>
                ))}
              </Grid>
            )}

            {createForm.text && (
              <Grid lg={12} md={12} xs={12} className="questionForm">
                {questionsArray.map((question) => (
                  <form id={question} className="questionForm">
                    <Grid lg={12} md={12} xs={12}>
                      <p>Question {question}</p>
                    </Grid>
                    <Grid lg={12} md={12} xs={12}>
                      <Button onClick={addQuestion}>
                        <AddIcon />
                      </Button>
                      <Button>
                        <SettingsIcon />
                      </Button>
                    </Grid>
                    <Grid lg={12} md={12} xs={12}>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 800 },
                        }}
                        id="question"
                        label="Question"
                        variant="outlined"
                        onChange={handleQuestionChange}
                      />
                    </Grid>
                  </form>
                ))}
              </Grid>
            )}

            {createForm.mcq && (
              <Grid lg={12} md={12} xs={12} className="questionForm">
                {questionsArray.map((question) => (
                  <form id={question} className="questionForm">
                    <Grid lg={12} md={12} xs={12}>
                      <p>Question {question}</p>
                    </Grid>
                    <Grid lg={12} md={12} xs={12}>
                      <Button onClick={addQuestion}>
                        <AddIcon />
                      </Button>
                      <Button>
                        <SettingsIcon />
                      </Button>
                    </Grid>
                    <Grid lg={12} md={12} xs={12}>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 800 },
                        }}
                        id="question"
                        label="Question"
                        variant="outlined"
                        onChange={handleQuestionChange}
                      />
                    </Grid>
                    {answerInput.includes("a") && (
                      <Grid lg={12} md={12} xs={12}>
                        <Checkbox
                          id="a"
                          name={question}
                          onChange={mcqAnswers}
                        ></Checkbox>
                        <TextField
                          sx={{
                            width: { sm: 300, md: 600 },
                          }}
                          id="answer"
                          label="Answer"
                          variant="outlined"
                          name="a"
                          onChange={handleQuestionChange}
                        />
                        <IconButton id="a" onClick={removeAnswer}>
                          <Delete id="a" />
                        </IconButton>
                      </Grid>
                    )}
                    {answerInput.includes("b") && (
                      <Grid lg={12} md={12} xs={12}>
                        <Checkbox
                          id="b"
                          name={question}
                          onChange={mcqAnswers}
                        ></Checkbox>
                        <TextField
                          sx={{
                            width: { sm: 300, md: 600 },
                          }}
                          id="answer"
                          label="Answer"
                          variant="outlined"
                          name="b"
                          onChange={handleQuestionChange}
                        />
                        <IconButton id="b" onClick={removeAnswer}>
                          <Delete id="b" />
                        </IconButton>
                      </Grid>
                    )}
                    {answerInput.includes("c") && (
                      <Grid lg={12} md={12} xs={12}>
                        <Checkbox
                          id="c"
                          name={question}
                          onChange={mcqAnswers}
                        ></Checkbox>
                        <TextField
                          sx={{
                            width: { sm: 300, md: 600 },
                          }}
                          id="answer"
                          label="Answer"
                          variant="outlined"
                          name="c"
                          onChange={handleQuestionChange}
                        />
                        <IconButton id="c" onClick={removeAnswer}>
                          <Delete id="c" />
                        </IconButton>
                      </Grid>
                    )}
                    {answerInput.includes("d") && (
                      <Grid lg={12} md={12} xs={12}>
                        <Checkbox
                          id="d"
                          name={question}
                          onChange={mcqAnswers}
                        ></Checkbox>
                        <TextField
                          sx={{
                            width: { sm: 300, md: 600 },
                          }}
                          id="answer"
                          label="Answer"
                          variant="outlined"
                          name="d"
                          onChange={handleQuestionChange}
                        />
                        <IconButton id="d" onClick={removeAnswer}>
                          <Delete id="d" />
                        </IconButton>
                      </Grid>
                    )}
                  </form>
                ))}
              </Grid>
            )}
            <Button variant="outlined" onClick={addQuestion}>
              Add Question
            </Button>
            <Button variant="outlined" onClick={saveMcq}>
              Save
            </Button>
          </Grid>
        </Card>
      )}
    </div>
  );
}

export default Quiz;
