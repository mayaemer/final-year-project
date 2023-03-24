import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import $ from "jquery";
import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import BackButton from "../components/BackButton";
import { Alert, TextField } from "@mui/material";
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
import {
  createQuizInfoSchema,
  createQuizSchema,
} from "../Validations/Validation";

function Quiz() {
  Axios.defaults.withCredentials = true;

  let { groupId } = useParams();

  const navigate = useNavigate();

  const [groupInfo, setGroupInfo] = useState([]);

  const [quizArray, setQuizArray] = useState([]);

  const [buttonVisibility, setButtonVisibility] = useState({
    add: false,
  });

  const [quizDisplay, setQuizDisplay] = useState({
    main: true,
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
    mcqEdit: false,
    mcqCreate: false,
    textBtns: false,
    validationError: false,
    validationErrorMsg: "",
  });

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizType, setQuizType] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questionsArray, setQuestionsArray] = useState([1]);
  const [quizToCreate, setQuizToCreate] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([
    { id: "a", correct: false },
    { id: "b", correct: false },
    { id: "c", correct: false },
    { id: "d", correct: false },
  ]);
  // const [correctAnswers, setCorrectAnswers] = useState([]);
  const [editQuestion, setEditQuestion] = useState();
  const [answerInput, setAnswerInput] = useState(["a", "b", "c", "d"]);
  const [deleteQuiz, setDeleteQuiz] = useState();
  const [answerValA, setAnswerValA] = useState({
    answer: "",
    correct: false,
  });
  const [answerValB, setAnswerValB] = useState({
    answer: "",
    correct: false,
  });
  const [answerValC, setAnswerValC] = useState({
    answer: "",
    correct: false,
  });
  const [answerValD, setAnswerValD] = useState({
    answer: "",
    correct: false,
  });

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

  const [noQuiz, setNoQuiz] = useState(false);

  const getQuiz = (userEmail) => {
    const data = {
      ID: groupId,
    };
    Axios.post("http://localhost:3001/getQuiz", data).then((res) => {
      if (res.data.length === 0) {
        setNoQuiz(true);
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
          quizParticipants.push(result.userEmail);
        });
        if (quizParticipants.includes(email) === true) {
          quiz.userCompletion = "Complete";
          quizDataCompletionArr.push(quiz);
        } else {
          //console.log(quiz);
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
    });
    setQuizDisplay({
      ...quizDisplay,
      main: false,
    });
  };

  const closeForm = () => {
    setQuizDisplay({
      ...quizDisplay,
      main: true,
    });
    setCreateForm({
      ...createForm,
      main: false,
      first: false,
      mcq: false,
      text: false,
      textBtns: false,
      tf: false,
      mcqCreate: false,
      mcqEdit: false,
      validationError: false,
    });
    setButtonVisibility({
      ...buttonVisibility,
      add: true,
    });
    setQuestion("");
    setAnswers([
      { id: "a", correct: false },
      { id: "b", correct: false },
      { id: "c", correct: false },
      { id: "d", correct: false },
    ]);
    setAnswerValA({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setAnswerValB({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setAnswerValC({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setAnswerValD({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setQuestionsArray([1]);
    setQuizToCreate([]);
    setCurrentQuestion(1);
  };

  const checkUser = (members, creator) => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        const user = response.data.user._id;
        getQuiz(user);

        const membersArr = [];
        members.forEach((member) => {
          membersArr.push(member.email);
        });

        if (membersArr.includes(user) || creator.email === user) {
          checkUserType(response.data.user.UserType, creator, user);
        } else {
          navigate("/group/" + groupId);
        }
      }
    });
  };

  const checkUserType = async (usertype, creator, email) => {
    if (usertype === "Teacher" && creator.email === email) {
      setButtonVisibility({
        ...buttonVisibility,
        add: true,
      });
      setView({
        ...view,
        teacher: true,
      });
    } else if (usertype === "Student") {
      setButtonVisibility({
        ...buttonVisibility,
        add: false,
      });
      setView({
        ...view,
        student: true,
      });
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const validateData = {
      title: quizTitle,
      type: quizType,
      start: startDate,
      end: endDate,
    };

    const validate = await createQuizInfoSchema.isValid(validateData);

    if (validate === true) {
      if (new Date(startDate) < new Date(endDate)) {
        if (quizType === "MCQ") {
          setCreateForm({
            ...createForm,
            first: false,
            mcq: true,
            mcqCreate: true,
            validationError: false,
          });
        } else if (quizType === "Text") {
          setCreateForm({
            ...createForm,
            first: false,
            text: true,
            textBtns: true,
            validationError: false,
          });
        }
      } else {
        setCreateForm({
          ...createForm,
          validationError: true,
          validationErrorMsg:
            "Invalid input. End date must be after start date.",
        });
      }
    } else {
      setCreateForm({
        ...createForm,
        validationError: true,
        validationErrorMsg: "All fields are required.",
      });
    }

    setButtonVisibility({
      add: false,
    });
  };

  // set the current question
  const addQuestion = () => {
    setAnswerInput(["a", "b", "c", "d"]);

    if (quizType === "MCQ") {
      setCreateForm({
        ...createForm,
        edit: false,
        mcqCreate: true,
        validationError: false,
      });
    }
    if (quizType === "Text") {
      setCreateForm({
        ...createForm,
        edit: false,
        text: true,
        validationError: false,
      });
    }
    setEditQuestion();
    const num = questionsArray.length;
    setQuestionsArray([...questionsArray, parseInt(num) + 1]);
    setCurrentQuestion(parseInt(num) + 1);
    setQuestion("");
    setAnswerValA({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setAnswerValB({
      ...answerValB,
      answer: "",
      correct: false,
    });
    setAnswerValC({
      ...answerValC,
      answer: "",
      correct: false,
    });
    setAnswerValD({
      ...answerValD,
      answer: "",
      correct: false,
    });
  };

  const test = () => {
    console.log(questionsArray);
  };

  const handleQuestionChange = (e) => {
    if (e.target.id === "questionText") {
      setQuestion(e.target.value);
    } else if (e.target.id === "answer") {
      const answerOption = e.target.name;
      const answerVal = e.target.value;
      const answerToSet = answers.find((a) => a.id === answerOption);
      answerToSet.answer = answerVal;
      answerToSet.selected = false;

      if (answerOption === "a") {
        setAnswerValA({
          ...answerValA,
          answer: answerVal,
        });
      }
      if (answerOption === "b") {
        setAnswerValB({
          ...answerValB,
          answer: answerVal,
        });
      }
      if (answerOption === "c") {
        setAnswerValC({
          ...answerValC,
          answer: answerVal,
        });
      }
      if (answerOption === "d") {
        setAnswerValD({
          ...answerValD,
          answer: answerVal,
        });
      }
    } else if (e.target.id === "correctCheck") {
      const answerOption = e.target.name;
      const answerToSet = answers.find((a) => a.id === answerOption);
      if (answerToSet.correct === false) {
        answerToSet.correct = true;
        if (answerOption === "a") {
          setAnswerValA({
            ...answerValA,
            correct: true,
          });
        }
        if (answerOption === "b") {
          setAnswerValB({
            ...answerValB,
            correct: true,
          });
        }
        if (answerOption === "c") {
          setAnswerValC({
            ...answerValC,
            correct: true,
          });
        }
        if (answerOption === "d") {
          setAnswerValD({
            ...answerValD,
            correct: true,
          });
        }
      } else if (answerToSet.correct === true) {
        answerToSet.correct = false;
        if (answerOption === "a") {
          setAnswerValA({
            ...answerValA,
            correct: false,
          });
        }
        if (answerOption === "b") {
          setAnswerValB({
            ...answerValB,
            correct: false,
          });
        }
        if (answerOption === "c") {
          setAnswerValC({
            ...answerValC,
            correct: false,
          });
        }
        if (answerOption === "d") {
          setAnswerValD({
            ...answerValD,
            correct: false,
          });
        }
      }
    }
  };

  const handleEditQuestion = (e) => {
    const id = parseInt(e.currentTarget.id);
    setCurrentQuestion(id);
    if (quizType === "MCQ") {
      setCreateForm({
        ...createForm,
        mcq: true,
        mcqEdit: true,
        edit: true,
        text: false,
        mcqCreate: false,
      });
    } else if (quizType === "Text") {
      setCreateForm({
        ...createForm,
        mcq: false,
        edit: true,
        text: false,
      });
    }
    const setQuestion = quizToCreate.find((q) => q.id === id);
    // console.log(setQuestion.question);
    setEditQuestion(setQuestion);
  };

  const editChange = (e) => {
    if (e.target.id === "questionText") {
      editQuestion.question = e.target.value;
    } else if (e.target.id === "answer") {
      const answerOption = e.target.name;
      const answerToSet = editQuestion.answers.find(
        (a) => a.id === answerOption
      );
      answerToSet.answer = e.target.value;
    } else if (e.target.id === "correctCheck") {
      const answerOption = e.target.name;
      const answerToSet = editQuestion.answers.find(
        (a) => a.id === answerOption
      );
      if (answerToSet.correct === true) {
        answerToSet.correct = false;
      } else if (answerToSet.correct === false) {
        answerToSet.correct = true;
      }
    }
  };

  const saveQuestion = async (id) => {
    const validateData = {
      question: question,
      answers: answers,
    };

    const validate = await createQuizSchema.isValid(validateData);

    if (validate === true) {
      const setMcqQuestion = quizToCreate.find((q) => q.id === id);
      if (setMcqQuestion != undefined) {
        setMcqQuestion.question = question;
        setMcqQuestion.answers = answers;
        setCreateForm({
          ...createForm,
          mcqCreate: false,
          text: false,
        });
        resetQAstates();
      } else {
        setQuizToCreate([
          ...quizToCreate,
          {
            id: id,
            question: question,
            answers: answers,
          },
        ]);
        setCreateForm({
          ...createForm,
          mcqCreate: false,
          text: false,
        });
        resetQAstates();
      }
    } else {
      setCreateForm({
        ...createForm,
        validationErrorMsg: "Invalid input. Questions cannot be empty.",
        validationError: true,
      });
    }
  };

  const saveEdit = () => {
    const setQuestion = quizToCreate.find((q) => q.id === editQuestion.id);
    setQuestion.question = editQuestion.question;
    setQuestion.answers = editQuestion.answers;

    if (quizType === "MCQ") {
      setCreateForm({
        ...createForm,
        mcq: true,
        edit: false,
        editMcq: false,
      });
    } else {
      setCreateForm({
        ...createForm,
        edit: false,
        editMcq: false,
      });
      const num = questionsArray.length;
      setCurrentQuestion(num);
    }
  };

  const resetQAstates = () => {
    setQuestion("");
    setAnswers([
      { id: "a", correct: false },
      { id: "b", correct: false },
      { id: "c", correct: false },
      { id: "d", correct: false },
    ]);
    setQuestion("");
    setAnswerValA({
      ...answerValA,
      answer: "",
      correct: false,
    });
    setAnswerValB({
      ...answerValB,
      answer: "",
      correct: false,
    });
    setAnswerValC({
      ...answerValC,
      answer: "",
      correct: false,
    });
    setAnswerValD({
      ...answerValD,
      answer: "",
      correct: false,
    });
  };

  const removeAnswer = (e) => {
    // when not returning id currentTarget
    const answerId = e.currentTarget.id;
    const filtered = answers.filter((ans) => ans.id != answerId);
    setAnswers(filtered);
    const removedElement = answerInput.filter((item) => item !== answerId);
    setAnswerInput(removedElement);
  };

  const saveQuiz = () => {
    // const correctAnswers = filterUndefined();
    const quizdata = {
      title: quizTitle,
      type: quizType,
      start: startDate,
      end: endDate,
      questions: quizToCreate,
      groupid: groupInfo._id,
      // correctAns: correctAnswers,
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
          //getQuiz();
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

      {quizDisplay.main && (
        <Card id="groupCard">
          <Grid lg={12} item container>
            <Grid item lg={12} md={12} xs={12}>
              <h3 id="header">Quizzes</h3>
            </Grid>
            <Grid item lg={1} md={1} xs={1} id="btnSection">
              <BackButton destination={"group/" + groupId}></BackButton>
            </Grid>
            <Grid item lg={1} md={1} xs={1} id="btnSection">
              {buttonVisibility.add && (
                <IconButton aria-label="addGroup" onClick={openForm}>
                  <AddIcon />
                </IconButton>
              )}
            </Grid>

            {quizDisplay.confirmDelete && (
              <Grid lg={12} item container>
                <Grid item lg={12} md={12} xs={12}>
                  <p>
                    Please confirm you wish to delete the '{deleteQuiz.title}'
                    quiz.
                  </p>
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                  <Button
                    variant="outlined"
                    onClick={handleDeleteQuiz}
                    id="deleteBtn"
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={cancelDelete}
                    id="deleteBtn"
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            )}
            {quizDisplay.deleteInProgress && (
              <Grid item lg={12} md={12} xs={12}>
                <p>Deleting quiz..</p>
                <Spinner></Spinner>
              </Grid>
            )}

            {quizDisplay.table && (
              <Table bordered>
                <thead>
                  <tr>
                    <th id="tableHead">Quiz</th>
                    {view.student && <th>Completion Status</th>}
                    {view.teacher && <th></th>}
                  </tr>
                </thead>
                {noQuiz && <tr>No quizzes available.</tr>}

                {quizDisplay.quizSelection && (
                  <tbody>
                    {quizArray.map((quiz) => (
                      <tr>
                        <td>
                          <Link
                            to={"/Quiz/" + groupId + "/" + quiz._id}
                            id="link"
                          >
                            <a>{quiz.title}</a>
                          </Link>
                          <p id="startEnd">Starts {quiz.start}</p>
                          <p id="startEnd">Ends {quiz.end}</p>
                        </td>
                        {view.student && (
                          <td>
                            <p>{quiz.userCompletion}</p>
                          </td>
                        )}
                        {view.teacher && (
                          <td>
                            <IconButton id={quiz._id}>
                              <Delete id={quiz._id} onClick={confirmDelete} />
                            </IconButton>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                )}
              </Table>
            )}
          </Grid>
        </Card>
      )}

      {createForm.loading && (
        <Card id='groupCard'>
          <Grid item lg={12} md={12} xs={12}>
            <p>Creating quiz..</p>
            <Spinner></Spinner>
          </Grid>
        </Card>
      )}

      {createForm.main && (
        <Card id="groupCard">
          <Grid container spacing={2}>
            <Grid lg={12} md={12} xs={12}>
              <h4 id="header">Create Quiz</h4>
            </Grid>
            <Grid item lg={1} md={1} xs={1} id="btnSection">
              <IconButton aria-label="addGroup" onClick={closeForm}>
                <RemoveIcon />
              </IconButton>
            </Grid>

            {createForm.first && (
              <Grid lg={12} md={12} xs={12} id="quizForm">
                <form onSubmit={handleNext}>
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
                      label="Quiz Title"
                      variant="outlined"
                      onChange={(e) => setQuizTitle(e.target.value)}
                    />
                  </Grid>
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
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
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
                      label="Start date and time"
                      type="datetime-local"
                      onChange={(e) => setStartDate(e.target.value)}
                      sx={{ width: 250 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
                      label="End date and time"
                      type="datetime-local"
                      onChange={(e) => setEndDate(e.target.value)}
                      sx={{ width: 250 }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  {createForm.validationError && (
                    <Grid item lg={5} md={5} xs={5} id="errorMsg">
                      <Alert severity="error">
                        {createForm.validationErrorMsg}
                      </Alert>
                    </Grid>
                  )}
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
                    {/* <Button onClick={addQuestion}>
                      <AddIcon />
                    </Button>
                    <Button>
                      <SettingsIcon />
                    </Button> */}
                  </Grid>
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
                      sx={{
                        width: { sm: 300, md: 800 },
                      }}
                      id="questionText"
                      defaultValue={editQuestion.question}
                      variant="outlined"
                      onChange={editChange}
                    />
                  </Grid>

                  {createForm.mcqEdit && (
                    <Grid>
                      {editQuestion.answers.map((ans) => (
                        <Grid lg={12} md={12} xs={12} id="textBox">
                          <Checkbox
                            id="correctCheck"
                            name={ans.id}
                            defaultChecked={ans.correct}
                            onClick={editChange}
                          ></Checkbox>
                          <TextField
                            sx={{
                              width: { sm: 300, md: 600 },
                            }}
                            id="answer"
                            defaultValue={ans.answer}
                            variant="outlined"
                            name={ans.id}
                            onChange={editChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </form>
                <Button
                  variant="outlined"
                  id={editQuestion.id}
                  onClick={(e) => saveEdit(e.target.id)}
                >
                  Save
                </Button>
              </Grid>
            )}

            {createForm.savedQuestions && (
              <Grid lg={12} md={12} xs={12}>
                {quizToCreate.map((q) => (
                  <Grid
                    id={q.id}
                    className="savedQuestion"
                    onClick={handleEditQuestion}
                  >
                    <p>Question {q.id}</p>
                    <p>{q.question}</p>
                    {createForm.mcq && (
                      <Grid>
                        {q.answers.map((ans) => (
                          <div>
                            <p>
                              {ans.id}. {ans.answer}
                            </p>
                          </div>
                        ))}
                      </Grid>
                    )}
                  </Grid>
                ))}
              </Grid>
            )}

            {createForm.text && (
              <Grid lg={12} md={12} xs={12} className="questionForm">
                {/* {questionsArray.map((question) => ( */}
                <form id={currentQuestion} className="questionForm">
                  <Grid lg={12} md={12} xs={12}>
                    <p>Question {currentQuestion}</p>
                  </Grid>
                  <Grid lg={12} md={12} xs={12} id="textBox">
                    <TextField
                      sx={{
                        width: { sm: 300, md: 800 },
                      }}
                      id="questionText"
                      label="Question"
                      variant="outlined"
                      value={question}
                      onChange={handleQuestionChange}
                    />
                  </Grid>
                  {createForm.validationError && (
                    <Grid lg={6} md={6} xs={6} id="errorMsg">
                      <Alert severity="error">
                        {createForm.validationErrorMsg}
                      </Alert>
                    </Grid>
                  )}
                  <Grid lg={12} md={12} xs={12} id="saveBtn">
                    <Button
                      variant="outlined"
                      onClick={() => saveQuestion(currentQuestion)}
                    >
                      Save Question
                    </Button>
                  </Grid>
                </form>
                {/* ))} */}
              </Grid>
            )}

            {createForm.mcqCreate && (
              <Grid lg={12} md={12} xs={12} className="questionForm">
                {/* {questionsArray.map((question) => ( */}
                <form id={currentQuestion} className="questionForm">
                  <Grid lg={12} md={12} xs={12}>
                    <p id="qNum">Question {currentQuestion}</p>
                  </Grid>
                  <Grid lg={12} md={12} xs={12}>
                    {/* <IconButton onClick={addQuestion}>
                        <AddIcon />
                      </IconButton> */}
                  </Grid>
                  <Grid lg={12} md={12} xs={12} id="questionForm">
                    <TextField
                      sx={{
                        width: { sm: 300, md: 800 },
                      }}
                      id="questionText"
                      label="Question"
                      variant="outlined"
                      onChange={handleQuestionChange}
                      value={question}
                    />
                  </Grid>
                  {answerInput.includes("a") && (
                    <Grid lg={12} md={12} xs={12} id="questionForm">
                      <Checkbox
                        id="correctCheck"
                        name="a"
                        onChange={handleQuestionChange}
                        checked={answerValA.correct}
                      ></Checkbox>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 600 },
                        }}
                        id="answer"
                        label="Answer"
                        variant="outlined"
                        name="a"
                        value={answerValA.answer}
                        onChange={handleQuestionChange}
                      />
                      <IconButton id="a" onClick={removeAnswer}>
                        <Delete id="a" />
                      </IconButton>
                    </Grid>
                  )}
                  {answerInput.includes("b") && (
                    <Grid lg={12} md={12} xs={12} id="questionForm">
                      <Checkbox
                        id="correctCheck"
                        name="b"
                        checked={answerValB.correct}
                        onChange={handleQuestionChange}
                      ></Checkbox>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 600 },
                        }}
                        id="answer"
                        label="Answer"
                        variant="outlined"
                        name="b"
                        value={answerValB.answer}
                        onChange={handleQuestionChange}
                      />
                      <IconButton id="b" onClick={removeAnswer}>
                        <Delete id="b" />
                      </IconButton>
                    </Grid>
                  )}
                  {answerInput.includes("c") && (
                    <Grid lg={12} md={12} xs={12} id="questionForm">
                      <Checkbox
                        id="correctCheck"
                        name="c"
                        defaultValue={false}
                        checked={answerValC.correct}
                        onChange={handleQuestionChange}
                      ></Checkbox>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 600 },
                        }}
                        id="answer"
                        label="Answer"
                        variant="outlined"
                        name="c"
                        value={answerValC.answer}
                        onChange={handleQuestionChange}
                      />
                      <IconButton id="c" onClick={removeAnswer}>
                        <Delete id="c" />
                      </IconButton>
                    </Grid>
                  )}
                  {answerInput.includes("d") && (
                    <Grid lg={12} md={12} xs={12} id="questionForm">
                      <Checkbox
                        id="correctCheck"
                        name="d"
                        checked={answerValD.correct}
                        onChange={handleQuestionChange}
                      ></Checkbox>
                      <TextField
                        sx={{
                          width: { sm: 300, md: 600 },
                        }}
                        id="answer"
                        label="Answer"
                        variant="outlined"
                        name="d"
                        value={answerValD.answer}
                        onChange={handleQuestionChange}
                      />
                      <IconButton id="d" onClick={removeAnswer}>
                        <Delete id="d" />
                      </IconButton>
                    </Grid>
                  )}
                  {createForm.validationError && (
                    <Grid lg={6} md={6} xs={6} id="errorMsg">
                      <Alert severity="error">
                        {createForm.validationErrorMsg}
                      </Alert>
                    </Grid>
                  )}
                  <Grid lg={12} md={12} xs={12} id="saveBtn">
                    <Button
                      variant="outlined"
                      onClick={() => saveQuestion(currentQuestion)}
                    >
                      Save Question
                    </Button>
                  </Grid>
                </form>
                {/* ))} */}
              </Grid>
            )}
            {createForm.mcq && (
              <Grid lg={12} md={12} xs={12} id="questionForm">
                <Button
                  variant="outlined"
                  onClick={addQuestion}
                  id="questionBtn"
                >
                  Add Question
                </Button>
                <Button variant="outlined" onClick={saveQuiz} id="questionBtn">
                  Save
                </Button>
              </Grid>
            )}

            {createForm.textBtns && (
              <Grid lg={12} md={12} xs={12} id="questionForm">
                <Button
                  variant="outlined"
                  onClick={addQuestion}
                  id="questionBtn"
                >
                  Add Question
                </Button>
                <Button variant="outlined" onClick={saveQuiz} id="questionBtn">
                  Save
                </Button>
              </Grid>
            )}
          </Grid>
        </Card>
      )}
    </Grid>
  );
}

export default Quiz;
