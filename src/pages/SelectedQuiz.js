import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Axios from "axios";
import { useState } from "react";
import { getCurrentDateTime } from "../functions/helper";
import BackButton from "../components/BackButton";
import $ from "jquery";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import {
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  Input,
  List,
  ListItem,
} from "@mui/material";
import Spinner from "react-bootstrap/Spinner";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import RemoveIcon from "@mui/icons-material/Remove";

function SelectedQuiz() {
  const { groupId, quizId } = useParams("/:groupId/:quizId");

  const navigate = useNavigate();

  const [quizData, setQuizData] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [completedBy, setCompletedBy] = useState({
    participantsList: true,
    noParticipants: false,
  });

  const [participantList, setParticipantList] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState({
    email: "",
    fname: "",
    sname: "",
    grade: "",
    end: "",
    answers: [],
  });

  const [view, setView] = useState({
    teacherMain: false,
    teacherQuizInfo: false,
    teacherReview: false,
    student: false,
  });

  const [groupInfo, setGroupInfo] = useState([]);
  const [userInfo, setUserInfo] = useState({
    email: "",
    fname: "",
    sname: "",
  });

  const [quizAvailable, setQuizAvailable] = useState({
    available: false,
    start: false,
    notAvailableStart: false,
    notAvailableEnd: false,
    loading: false,
    complete: false,
  });

  const [quizType, setQuizType] = useState({
    mcq: false,
    text: false,
  });

  const [textAnswer, setTextAnswer] = useState({
    answer: "",
    qid: "",
  });

  const [allAnswers, setAllAnswers] = useState([]);

  const [textQuiz, setTextQuiz] = useState({
    marks: 0,
    qid: 0,
    current: 0,
  });

  const [currMark, setCurrMark] = useState({
    qid: 0,
    mark: 0,
  });

  const handleMarks = (e) => {
    const re = /^[0-9\b]+$/;

    setCurrMark({
      qid: e.target.id,
      mark: e.target.value,
    });
    if (e.target.value === "" || re.test(e.target.value)) {
      if (e.target.value > 5) {
      }
    } else {
    }
  };

  const saveMark = (e) => {};

  const showUsersQuiz = (e) => {
    setView({
      ...view,
      teacherQuizInfo: false,
      teacherReview: true,
    });
    const selectedUser = e.target.id;
    quizData.results.forEach((result) => {
      //console.log(result[0])
      if (result[0]["userEmail"] === selectedUser) {
        if (quizType.mcq === true) {
          formatMcqAns(result);
        } else if (quizType.text === true) {
          formatTextQuizAns(result);
          setTextQuiz({
            ...textQuiz,
            inputField: true,
          });
        }
      }
    });
  };

  const formatMcqAns = (data) => {
    let ansObjArr = [];
    for (let i = 0; i < quizData.questions.length; i++) {
      const ansObj = {
        questions: quizData.questions[i],
        //   answers : data[0]["answers"][i]
      };
      ansObjArr.push(ansObj);
    }

    for (let i = 0; i < ansObjArr.length; i++) {
      ansObjArr[i].questions.answers = data[0]["answers"][i];
    }

    setSelectedUserData({
      userEmail: data[0]["userEmail"],
      userFname: data[0]["userFname"],
      userSname: data[0]["userSname"],
      end: data[0]["end"],
      grade: data[0]["grade"],
      answers: ansObjArr,
    });
  };

  const formatTextQuizAns = (data) => {
    //console.log(data);
    const questionAnsArr = [];
    for (let i = 0; i < quizData.questions.length; i++) {
      if (quizData.questions[i]["id"] == data[0]["answers"][i]["qid"]) {
        const questionAns = {
          id: quizData.questions[i]["id"],
          question: quizData.questions[i]["question"],
          answer: data[0]["answers"][i]["answer"],
        };
        questionAnsArr.push(questionAns);
      }
    }
    setSelectedUserData({
      ...selectedUserData,
      userEmail: data[0]["userEmail"],
      userFname: data[0]["userFname"],
      userSname: data[0]["userSname"],
      end: data[0]["end"],
      grade: data[0]["grade"],
      answers: questionAnsArr,
    });
  };

  const closeReview = () => {
    setView({
      ...view,
      teacherQuizInfo: true,
      teacherReview: false,
    });
  };

  const handleTest = () => {
    console.log(selectedUserData);
  };

  const getSelectedQuiz = () => {
    const data = {
      ID: quizId,
    };
    Axios.post("http://localhost:3001/getSelectedQuiz", data).then((res) => {
      setQuizData(res.data);
      checkDateTime(res.data.start, res.data.end);
      setQuestionData(res.data.questions);
      getQuizParticipants(res.data.results);
      checkQuizType(res.data.type);
      console.log(res);
    });
  };

  const checkQuizType = (type) => {
    //console.log(type);
    if (type === "MCQ") {
      setQuizType({
        ...quizType,
        mcq: true,
      });
    } else if (type === "Text") {
      setQuizType({
        ...quizType,
        text: true,
      });
    }
  };

  const getQuizParticipants = (results) => {
    const participantsArr = [];
    results.forEach((result) =>
      result.forEach((item) => {
        if (
          item.userEmail != "" &&
          item.userSname != "" &&
          item.userEmail != ""
        ) {
          const participantData = {
            fname: item.userFname,
            sname: item.userSname,
            email: item.userEmail,
          };

          participantsArr.push(participantData);
        }
      })
    );

    if (participantsArr.length > 0) {
      setParticipantList(participantsArr);
      setCompletedBy({
        ...completedBy,
        participantsList: true,
      });
      console.log(currentUser);
    } else {
      setCompletedBy({
        ...completedBy,
        noParticipants: true,
      });
    }
    //console.log(participantList);
  };

  const checkDateTime = (startDateTime, endDateTime) => {
    const currDateTime = new Date(getCurrentDateTime());
    const startDT = new Date(startDateTime + ":00");
    const endDT = new Date(endDateTime + ":00");

    if (currDateTime < startDT) {
      setQuizAvailable({
        ...quizAvailable,
        notAvailableStart: true,
        notAvailableEnd: false,
        available: false,
      });
    } else if (currDateTime > endDT) {
      setQuizAvailable({
        ...quizAvailable,
        notAvailableEnd: true,
        notAvailableStart: false,
        available: false,
      });
    } else if (currDateTime >= startDT && currDateTime <= endDT) {
      setQuizAvailable({
        ...quizAvailable,
        available: true,
        notAvailableStart: false,
      });
    } else {
      console.error("Error");
    }
  };

  const startQuiz = () => {
    setQuizAvailable({
      ...quizAvailable,
      available: false,
      start: true,
    });
  };

  const selectOption = (e) => {
    const qid = e.target.id;
    const answer = e.target.value;

    for (let i = 0; i < quizData.questions.length; i++) {
      if (quizData.questions[i]["id"] == qid) {
        const setSelected = quizData.questions[i]["answers"].find(
          (ans) => ans.id === answer
        );
        if (setSelected.selected === true) {
          setSelected.selected = false;
          //console.log(setSelected);
        } else if (setSelected.selected === false) {
          setSelected.selected = true;
          //console.log(setSelected);
        } else if (setSelected.selected === undefined) {
          setSelected.selected = true;
          //console.log(setSelected);
        }
      }
    }
  };

  const gradeMCQ = () => {
    const numQuestions = quizData.questions.length;
    let totalMarks = 0;

    quizData.questions.forEach((q) => {
      let numOfCorrect = 0;
      for (let i = 0; i < q.answers.length; i++) {
        if (q.answers[i]["correct"] === true) {
          numOfCorrect += 1;
        }
      }
      for (let i = 0; i < q.answers.length; i++) {
        if (
          q.answers[i]["correct"] === true &&
          q.answers[i]["selected"] === true
        ) {
          const markPerAnswer = 1 / numOfCorrect;
          totalMarks += markPerAnswer;
        }
      }
    });

    //console.log(totalMarks)
    const total = 100 * (totalMarks / numQuestions);
    //console.log(total)
    return total;
  };

  const saveAnswer = () => {
    const setAnswer = allAnswers.find((ans) => ans.qid === textAnswer.qid);
    if (textAnswer.qid) {
      if (setAnswer === undefined) {
        setAllAnswers([
          ...allAnswers,
          {
            qid: textAnswer.qid,
            answer: textAnswer.answer,
          },
        ]);
      } else if (setAnswer != undefined) {
        setAnswer.answer = textAnswer.answer;
      }
    }
    //setAllAnswers([...allAnswers, completeAnswer]);
  };

  const handleTextChange = (e) => {
    const answer = e.target.value;
    const qid = e.target.id;
    setTextAnswer({
      answer: answer,
      qid: qid,
    });
    //console.log(allAnswers);
  };

  const endQuiz = () => {
    if (quizData.type === "MCQ") {
      const grade = gradeMCQ();
      let answers = [];
      questionData.forEach((q) => {
        answers.push(q.answers);
      });
      //console.log(answers)
      formatToSend(answers, grade);
    } else if (quizData.type === "Text") {
      const completeAnswer = {
        qid: textAnswer.qid,
        answer: textAnswer.answer,
      };
      if (textAnswer.qid != "") {
        const answerArr = allAnswers;
        const alreadyAnswered = [];
        answerArr.forEach((ans) => {
          alreadyAnswered.push(ans.qid);
        });
        if (alreadyAnswered.includes(textAnswer.qid) === true) {
          for (let i = 0; i < answerArr.length; i++) {
            if (answerArr[i] === textAnswer.qid) {
              answerArr = completeAnswer;
            }
          }
        } else if (alreadyAnswered.includes(textAnswer.qid) === false) {
          answerArr.push(completeAnswer);
        }

        formatToSend(answerArr);
      }
    }
  };

  const formatToSend = (answers, grade) => {
    setQuizAvailable({
      ...quizAvailable,
      start: false,
      loading: true,
    });

    const endTime = getCurrentDateTime();
    const usersAnswerData = {
      quiz: quizId,
      userFname: userInfo.fname,
      userSname: userInfo.sname,
      userEmail: userInfo.email,
      answers: answers,
      end: endTime,
      grade: grade,
    };
    sendAnswers(usersAnswerData);
  };

  const sendAnswers = (data) => {
    setTimeout(
      Axios.post("http://localhost:3001/sendAnswers", data)
        .then((result) => {
          console.log(result);
          setQuizAvailable({
            ...quizAvailable,
            start: false,
            loading: false,
            complete: true,
          });
        })
        .catch((e) => console.error(e)),
      2000
    );
  };

  const quizComplete = () => {
    navigate("/Quiz/" + groupId);
  };

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

  const checkUser = (members, creator) => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setUserInfo({
          email: response.data.user._id,
          fname: response.data.user.Fname,
          sname: response.data.user.Sname,
        });
        const accountEmail = response.data.user._id;
        setCurrentUser(accountEmail);
        if (
          creator === accountEmail ||
          members.includes(accountEmail) === true
        ) {
          checkUserType(response.data.user.UserType, accountEmail, creator);
        } else {
          navigate("/group/" + groupId);
        }
      }
    });
  };

  const checkUserType = async (usertype, email, creator) => {
    if (usertype === "Teacher" && email === creator) {
      setView({
        ...view,
        teacherMain: true,
        teacherQuizInfo: true,
      });
    } else {
      setView({
        ...view,
        student: true,
      });
    }
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/isAuthenticated", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      const authenticated = response.data;
      if (authenticated === true) {
        navigate("/Quiz/" + groupId + "/" + quizId);
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          getSelectedQuiz();
          getGroupData();
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
      <BackButton destination={"quiz/" + groupId}></BackButton>
      <h3>{quizData.title}</h3>

      <button onClick={handleTest}>test</button>

      {view.teacherMain && (
        <Grid>
          <Card>
            {view.teacherQuizInfo && (
              <Grid>
                <p>Quiz starts: {quizData.start}</p>
                <p>Quiz ends: {quizData.end}</p>
                <p>Quiz type: {quizData.type}</p>
                <p>Completed by:</p>
                {completedBy.noParticipants && (
                  <p>No users have completed this quiz.</p>
                )}
                {completedBy.participantsList && (
                  <Grid>
                    <ul>
                      {participantList.map((item) => (
                        <Grid>
                          <Grid>
                            <p id={item.email}>
                              {item.fname} {item.sname}
                            </p>
                          </Grid>
                          <Grid>
                            <Button id={item.email} onClick={showUsersQuiz}>
                              Review results
                            </Button>
                          </Grid>
                        </Grid>
                      ))}
                    </ul>
                  </Grid>
                )}
              </Grid>
            )}

            {view.teacherReview && (
              <Grid>
                <IconButton
                  aria-label="closeReview"
                  onClick={closeReview}
                  id="reviewBtn"
                >
                  <RemoveIcon />
                </IconButton>

                <p>
                  Quiz attempt of: {selectedUserData.userFname}{" "}
                  {selectedUserData.userSname}
                </p>
                <p>Quiz finished at: {selectedUserData.end}</p>
                <p>Grade: {selectedUserData.grade}</p>
                {quizType.text && (
                  <Grid>
                    {selectedUserData.answers.map((ans, index) => (
                      <Grid>
                        <p>Q.{ans.id}</p>
                        <p>{ans.question}</p>

                        <p>{ans.answer}</p>
                        <TextField
                          id={ans.id}
                          variant="outlined"
                          sx={{ width: 80 }}
                          size="small"
                          onBlur={saveMark}
                          name={index}
                          onChange={handleMarks}
                          defaultValue={currMark.mark}
                        />

                        <p>/5</p>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {quizType.mcq && (
                  <Grid>
                    {selectedUserData.answers.map((item) => (
                      <Grid>
                        <p>
                          Q.{item.questions.id} {item.questions.question}
                        </p>
                        {item.questions.answers.map((ans) => (
                          <Grid
                            style={{
                              backgroundColor: ans.correct
                                ? "#d9fae0"
                                : "white",
                            }}
                          >
                            <Checkbox
                              disabled
                              defaultChecked={ans.selected}
                            ></Checkbox>
                            <p>{ans.answer}</p>
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                  </Grid>
                )}
                <Button variant="outlined">Save</Button>
              </Grid>
            )}
          </Card>
        </Grid>
      )}

      {view.student && (
        <Grid>
          {quizAvailable.notAvailableStart && <p>Quiz not available yet</p>}

          {quizAvailable.notAvailableEnd && <p>Quiz ended</p>}

          <button onClick={gradeMCQ}>test</button>

          {quizAvailable.available && (
            <div>
              <p>Current User</p>
              <p>
                {userInfo.fname} {userInfo.sname}
              </p>
              <p>Quiz Period</p>
              <p>
                Available on {quizData.start} until {quizData.end}
              </p>
              <Button variant="outlined" onClick={startQuiz}>
                Start Quiz
              </Button>
            </div>
          )}

          {quizAvailable.start && (
            <div>
              {Object.keys(questionData).map((q, i) => (
                <div id="questionSection">
                  <p>Question {questionData[q].id}</p>
                  <p>{questionData[q].question}</p>
                  {quizType.mcq && (
                    <FormGroup>
                      {Object.keys(questionData[q].answers).map((a, j) => (
                        <FormControlLabel
                          value={questionData[q].answers[a].id}
                          control={<Checkbox id={questionData[q].id} />}
                          label={questionData[q].answers[a].answer}
                          onClick={selectOption}
                        ></FormControlLabel>
                      ))}
                    </FormGroup>
                  )}
                  {quizType.text && (
                    <Grid>
                      <TextField
                        fullWidth
                        id={questionData[q].id}
                        placeholder="Type here.."
                        multiline
                        rows={4}
                        onClick={saveAnswer}
                        onChange={handleTextChange}
                      />
                    </Grid>
                  )}
                </div>
              ))}

              <Button variant="outlined" onClick={endQuiz}>
                End Quiz
              </Button>
            </div>
          )}

          {quizAvailable.loading && (
            <div>
              <p>Saving data</p>
              <Spinner></Spinner>
            </div>
          )}

          {quizAvailable.complete && (
            <Alert severity="success">
              Quiz Complete
              <Button onClick={quizComplete}>Ok</Button>
            </Alert>
          )}
        </Grid>
      )}
    </div>
  );
}

export default SelectedQuiz;
