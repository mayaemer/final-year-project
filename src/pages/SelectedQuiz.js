import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Axios from "axios";
import { useState } from "react";
import { getCurrentDateTime } from "../functions/helper";
import BackButton from "../components/BackButton";
import $ from "jquery";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import { Checkbox, FormControlLabel } from "@mui/material";
import Spinner from "react-bootstrap/Spinner";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function SelectedQuiz() {
  const { groupId, quizId } = useParams("/:groupId/:quizId");

  const navigate = useNavigate();

  const [quizData, setQuizData] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [completedBy, setCompletedBy] = useState({
    participantsList: true,
    noParticipants: false,
  });

  const [participantList, setParticipantList] = useState([]);

  const [view, setView] = useState({
    teacher: false,
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

  const getSelectedQuiz = () => {
    const data = {
      ID: quizId,
    };
    Axios.post("http://localhost:3001/getSelectedQuiz", data).then((res) => {
      setQuizData(res.data);
      checkDateTime(res.data.start, res.data.end);
      setQuestionData(res.data.questions);
      getQuizParticipants(res.data.results);
      console.log(res);
    });
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
    } else {
      setCompletedBy({
        ...completedBy,
        noParticipants: true,
      });
    }
    console.log(participantList);
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

    //console.log(answer);

    const setSelectedAnswer = selected.find((ans) => ans.id === qid);
    //console.log(setSelectedAnswer)
    if (setSelectedAnswer === undefined) {
      setSelected([
        ...selected,
        {
          id: qid,
          answer: [answer],
        },
      ]);
    } else if (setSelectedAnswer != undefined) {
      if (setSelectedAnswer.answer.includes(answer) === true) {
        for (let i = 0; i < setSelectedAnswer.answer.length; i++) {
          if (setSelectedAnswer.answer[i] === answer) {
            setSelectedAnswer.answer[i] = "undefined";
          }
        }
      } else if (setSelectedAnswer.answer != answer) {
        // add new item to existing array
        setSelectedAnswer.answer = [...setSelectedAnswer.answer, answer];
      }
    }
  };

  const filterUndefined = () => {
    let selectedAnsArr = [];
    console.log(selected);
    selected.map((sa) => {
      console.log(sa);
      let selectedAnswerItem = sa;
      const filteredAns = selectedAnswerItem.answer.filter(
        (item) => item != "undefined"
      );
      let answerObject = {
        qid: sa.id,
        answer: filteredAns,
      };

      selectedAnsArr.push(answerObject);
    });

    return selectedAnsArr;
  };

  const gradeMCQ = (selectedAnswers) => {
    const correctAns = quizData.correctAnswers;
    const numQuestions = quizData.questions.length;
    let totalMarks = 0;

    correctAns.forEach((correct) => {
      selectedAnswers.forEach((ans) => {
        console.log(ans, 'ans')
        if (correct.qid === ans.qid) {
          ans.answer.forEach((opt) => {
            if (correct.aid.includes(opt)) {
              const markPerAnswer = 1 / correct.aid.length;
              totalMarks += markPerAnswer;
            }
          });
        }
      });
    });

    const total = 100 * (totalMarks / numQuestions);
    //console.log(total)
    return total;
  };

  const endQuiz = () => {
    const selectedAnswers = filterUndefined();
    const grade = gradeMCQ(selectedAnswers);

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
      answers: selectedAnswers,
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
        teacher: true,
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

  const handleTest = () => {
    gradeMCQ();
  };

  return (
    <div>
      <div id="groupTitle">
        <h1 id="groupHeader">{groupInfo.groupName}</h1>
      </div>
      <BackButton destination={"quiz/" + groupId}></BackButton>
      <h3>{quizData.title}</h3>

      {view.teacher && (
        <Grid>
          <Card>
            <button onClick={handleTest}>test</button>
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
                      <p>
                        {item.fname} {item.sname}
                      </p>
                    </Grid>
                  ))}
                </ul>
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
                  <p>Question {questionData[q].question}</p>
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
