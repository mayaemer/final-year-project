import { useParams } from "react-router-dom";
import Axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import $ from "jquery";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import "../styles/SelectedGroup.css";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Fab from "@mui/material/Fab";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
  Snackbar,
} from "@mui/material";
import Refresh from "../components/Refresh";
import {
  updateGroupNameSchema,
  updatePassSchema,
} from "../Validations/Validation";
import HomeIcon from "@mui/icons-material/Home";
import { Close } from "@mui/icons-material";
import { Spinner } from "react-bootstrap";

function SelectedGroup() {
  let { selectedGroup } = useParams();

  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  //const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState({
    email: "",
    fname: "",
    sname: "",
  });

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [mainVisible, setMainVisible] = useState(true);
  const [infoVisible, setInfoVisible] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);

  const [groupInfo, setGroupInfo] = useState([]);

  const [editName, setEditName] = useState(false);
  const [showName, setShowName] = useState(true);
  const [updatedName, setUpdatedName] = useState("");

  const [editPass, setEditPass] = useState(false);
  const [showPass, setShowPass] = useState(true);
  const [updatedPass, setUpdatedPass] = useState("");

  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [passErrorMessage, setPassErrorMessage] = useState("");

  const [membersView, setMembersView] = useState(false);
  const [publicView, setPublicView] = useState(false);
  const [joinForm, setJoinForm] = useState(false);
  const [creatorSettings, setCreatorSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(true);

  const [groupPass, setGroupPass] = useState("");
  const [viewSelectedUser, setViewSelectedUser] = useState();
  const [deletePass, setDeletePass] = useState("");
  const [viewProfanity, setViewProfanity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  Axios.defaults.withCredentials = true;

  const getGroupData = () => {
    const data = { ID: selectedGroup };
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      setGroupName(res.data.groupName);
      $("#groupTitle").css(
        "background-image",
        "url(" + res.data.image.image + ")"
      );
      checkUser(res.data.members, res.data.creator);
      countPronfaneOccurances(res.data);
    });
  };

  const countPronfaneOccurances = (groupInfo) => {
    for (let i = 0; i < groupInfo.members.length; i++) {
      const setMember = groupInfo.members.find(
        (member) => member.email === groupInfo.members[i].email
      );

      const occurences = groupInfo.members[i].profanityMonitoring.length;
      setMember.profanceOccurences = occurences;
    }
  };

  const showUserProfaneIncidents = (e) => {
    const selected = groupInfo.members.filter(
      (member) => member.email === e.target.id
    );
    setViewSelectedUser(selected[0]);
    setMembersVisible(false);
    setViewProfanity(true);
  };

  const closeView = () => {
    setViewProfanity(false);
    setMembersVisible(true);
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setDeleteBtn(true);
  };

  const checkUser = (members, creator) => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        //setEmail(response.data.user._id);
        setCurrentUser({
          email: response.data.user._id,
          fname: response.data.user.Fname,
          sname: response.data.user.Sname,
        });
        //console.log(response.data.user)
        const user = response.data.user._id;

        const membersArr = [];
        members.forEach((member) => {
          membersArr.push(member.email);
        });

        if (membersArr.includes(user)) {
          setMembersView(true);
          setPublicView(false);
        } else if (creator.email === user) {
          setMembersView(true);
          setPublicView(false);
          setCreatorSettings(true);
        } else {
          setPublicView(true);
        }
      }
    });
  };

  const clickSettings = () => {
    if (mainVisible === true) {
      setMainVisible(false);
      setSettingsVisible(true);
    } else {
      setMainVisible(true);
      setSettingsVisible(false);
      setMembersVisible(false);
      setInfoVisible(false);
    }
  };

  const handleBack = () => {
    navigate("/Home");
  };

  const handleGroupInfo = () => {
    if (infoVisible === true) {
      setInfoVisible(false);
    } else {
      setInfoVisible(true);
      setMembersVisible(false);
      setViewProfanity(false);
    }
  };

  const handleMembers = () => {
    if (membersVisible === true) {
      setMembersVisible(false);
    } else {
      setMembersVisible(true);
      setInfoVisible(false);
      setViewProfanity(false);
    }
  };

  const handleEditName = () => {
    setEditName(true);
    setShowName(false);
  };

  const handleEditPass = () => {
    setEditPass(true);
    setShowPass(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <Close fontSize="small" />
    </IconButton>
  );

  const saveUpdate = async (e) => {
    const updatedData = {
      ID: groupInfo._id,
      Name: updatedName,
    };

    const validate = await updateGroupNameSchema.isValid(updatedData);

    if (validate === true) {
      setNameErrorMessage("");

      try {
        Axios.post("http://localhost:3001/updateInfo", updatedData)
          .then((res) => {
            console.log(res);
            Refresh();
          })
          .catch((e) => console.log(e));
      } catch (e) {
        console.log(e);
      }
    } else {
      setNameErrorMessage("Group name not valid");
    }
  };

  const saveUpdatedPass = async (e) => {
    const updatedData = {
      ID: groupInfo._id,
      Pass: updatedPass,
    };

    const validate = await updatePassSchema.isValid(updatedData);

    if (validate === true) {
      setPassErrorMessage("");
      try {
        Axios.post("http://localhost:3001/updatePass", updatedData)
          .then((res) => {
            console.log(res);
            Refresh();
          })
          .catch((e) => console.log(e));
      } catch (e) {
        console.log(e);
      }
    } else {
      setPassErrorMessage("Password not valid");
    }
  };

  const cancelNameUpdate = () => {
    setEditName(false);
    setShowName(true);
    setNameErrorMessage(false);
  };

  const cancelPassUpdate = () => {
    setEditPass(false);
    setShowPass(true);
    setPassErrorMessage(false);
  };

  const handlePublicBack = () => {
    navigate("/Discover");
  };

  const showJoinForm = () => {
    setJoinForm(true);
    setPublicView(false);
  };

  const handleSubmit = () => {
    const data = {
      user: currentUser,
      group: selectedGroup,
      password: groupPass,
      profanityMonitoring: [],
    };

    Axios.post("http://localhost:3001/joinGroup", data)
      .then(function (res) {
        console.log(res);
      })
      .catch((e) => console.log(e));
  };

  const showConfirmDelete = () => {
    setConfirmDelete(true);
    setDeleteBtn(false);
  };

  const handleDelete = () => {
    const data = {
      ID: groupInfo._id,
      Pass: confirmDelete,
    };
    setInfoVisible(false);
    setLoading(true);
    setTimeout(() => {
      Axios.post("http://localhost:3001/deleteGroup", data)
        .then((res) => console.log(res))
        .then((result) => navigate("/Home"))
        .catch((e) => console.log(e))},
        3000);
  };

  const cancelJoin = () => {
    setJoinForm(false);
    setPublicView(true);
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/isAuthenticated", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      const authenticated = response.data;
      if (authenticated === true) {
        navigate("/group/" + selectedGroup);
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
    <div>
      <div id="groupTitle">
        <h1 id="groupHeader">{groupName}</h1>
      </div>

      {membersView && (
        <div>
          {mainVisible && (
            <Card id="groupCard">
              <Grid lg={12} item container spacing={2}>
                <Grid item lg={4} md={4} xs={6}>
                  <Link to={"/Content/" + groupInfo._id} id="contentLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Content</p>
                    </Paper>
                  </Link>
                </Grid>
                <Grid item lg={4} md={4} xs={6}>
                  <Link to={"/Questions/" + groupInfo._id} id="questionsLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Questions</p>
                    </Paper>
                  </Link>
                </Grid>
                {/* <Grid item lg={3} md={3} xs={6}>
                  <Link to={"/polls"} id="pollsLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Polls</p>
                    </Paper>
                  </Link>
                </Grid> */}
                <Grid item lg={4} md={4} xs={6}>
                  <Link to={"/Quiz/" + groupInfo._id} id="quizLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Quiz</p>
                    </Paper>
                  </Link>
                </Grid>
              </Grid>
            </Card>
          )}
          {settingsVisible && (
            <div id="settingsMenu">
              <Grid lg={12} item container spacing={2} id="main">
                <Grid item lg={3} md={3} xs={12}>
                  <Card id="groupCard">
                    <MenuList>
                      <MenuItem onClick={handleGroupInfo}>
                        Group Information
                      </MenuItem>
                      <MenuItem onClick={handleMembers}>Members</MenuItem>
                    </MenuList>
                  </Card>
                </Grid>

                {loading && (
                  <Grid item lg={9} md={9} xs={12}>
                    <p>Deleting group..</p>
                    <Spinner></Spinner>
                  </Grid>
                )}

                {infoVisible && (
                  <Grid item lg={9} md={9} xs={12}>
                    <Card id="groupSettings">
                      <Grid lg={12} item container spacing={2}>
                        <Grid item lg={12} md={12} xs={12} id="title">
                          <h4>Group Information Settings</h4>
                        </Grid>
                        <Grid item lg={4} md={4} xs={12} id="id">
                          <p>Group ID</p>
                        </Grid>
                        <Grid item lg={4} md={4} xs={12} id="id">
                          <p>{groupInfo._id}</p>
                        </Grid>
                        <Grid item lg={4} md={4} xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              navigator.clipboard.writeText(groupInfo._id);
                              setOpen(true);
                            }}
                          >
                            Copy
                          </Button>
                        </Grid>

                        <Grid item lg={4} md={4} xs={12} id="name">
                          <p>Group Name</p>
                        </Grid>
                        {showName && (
                          <Grid lg={8} item container id="nameGrid">
                            <Grid item lg={6} md={6} xs={12}>
                              <p>{groupInfo.groupName}</p>
                            </Grid>
                            <Grid item lg={6} md={6} xs={12}>
                              <Button
                                variant="outlined"
                                onClick={handleEditName}
                              >
                                Edit
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                        {editName && (
                          <Grid lg={8} item container id="test">
                            <Grid item lg={6} md={6} xs={12} id="text">
                              <TextField
                                id="outlined-basic"
                                variant="outlined"
                                onChange={(e) => setUpdatedName(e.target.value)}
                              />
                            </Grid>
                            <Grid item lg={6} md={6} xs={12} id="submit">
                              <Button
                                id="editBtn"
                                variant="outlined"
                                onClick={saveUpdate}
                              >
                                Save
                              </Button>
                              <Button
                                id="editBtn"
                                variant="outlined"
                                onClick={cancelNameUpdate}
                              >
                                Cancel
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                        <Grid item lg={12} md={12} xs={12} id="submit">
                          <p>{nameErrorMessage}</p>
                        </Grid>
                        <Grid item lg={4} md={4} xs={12}>
                          <p>Password</p>
                        </Grid>
                        {showPass && (
                          <Grid lg={8} item container id="test">
                            <Grid item lg={6} md={6} xs={12}>
                              <p>********</p>
                            </Grid>

                            <Grid item lg={6} md={6} xs={12}>
                              <Button
                                variant="outlined"
                                onClick={handleEditPass}
                              >
                                Edit
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                        {editPass && (
                          <Grid lg={8} item container id="test">
                            <Grid item lg={6} md={6} xs={12} id="text">
                              <TextField
                                id="outlined-basic"
                                variant="outlined"
                                onChange={(e) => setUpdatedPass(e.target.value)}
                              />
                            </Grid>
                            <Grid item lg={6} md={6} xs={12} id="submit">
                              <Button
                                id="editBtn"
                                variant="outlined"
                                onClick={saveUpdatedPass}
                              >
                                Save
                              </Button>
                              <Button
                                id="editBtn"
                                variant="outlined"
                                onClick={cancelPassUpdate}
                              >
                                Cancel
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                        <Grid item lg={12} md={12} xs={12} id="submit">
                          <p>{passErrorMessage}</p>
                        </Grid>
                      </Grid>
                      {deleteBtn && (
                        <Grid lg={12} item container>
                          <Grid item lg={12} md={12} xs={12}>
                            <Button
                              onClick={showConfirmDelete}
                              variant="outlined"
                            >
                              Delete Group
                            </Button>
                          </Grid>
                        </Grid>
                      )}

                      {confirmDelete && (
                        <Grid lg={12} item container id="test">
                          <Grid item lg={12} md={12} xs={12} id="text">
                            <p>Enter password to confirm deletion:</p>
                            <TextField
                              id="outlined-basic"
                              variant="outlined"
                              type="password"
                              onChange={(e) => setDeletePass(e.target.value)}
                            />
                          </Grid>

                          <Grid item lg={12} md={12} xs={12}>
                            <Button
                              variant="outlined"
                              onClick={handleDelete}
                              id="deleteBtn"
                            >
                              Delete
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
                    </Card>
                  </Grid>
                )}

                {membersVisible && (
                  <Grid item lg={9} md={9} xs={12}>
                    <Card id="groupSettings">
                      <Grid lg={12} item container spacing={2}>
                        <Grid item lg={12} md={12} xs={12}>
                          <h4 id="header">Group Members</h4>
                        </Grid>
                        <Grid item lg={12} md={12} xs={12}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <h6>Users</h6>
                                </TableCell>
                                <TableCell>
                                  <h6>Profanity Monitoring Occurences</h6>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {groupInfo.members.map((member) => (
                                <TableRow>
                                  <TableCell>
                                    <p>
                                      {member.fname} {member.sname}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    {member.profanceOccurences}
                                    <Button
                                      id={member.email}
                                      onClick={showUserProfaneIncidents}
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                )}

                {viewProfanity && (
                  <Grid item lg={9} md={9} xs={12}>
                    <Card id="groupSettings">
                      <Grid lg={12} item container spacing={2}>
                        <Grid item lg={12} md={12} xs={12}>
                          <h4 id="header">Group Members</h4>
                        </Grid>
                        <Grid item lg={2} md={2} xs={2} id="closeProfanityView">
                          <IconButton onClick={closeView}>
                            <Close />
                          </IconButton>
                        </Grid>
                        <Grid item lg={12} md={12} xs={12}>
                          <p>
                            Occurances of profane detection from{" "}
                            {viewSelectedUser.fname} {viewSelectedUser.sname}
                          </p>
                        </Grid>
                        {viewSelectedUser.profanityMonitoring.map(
                          (profanity) => (
                            <Grid item lg={12} md={12} xs={12} id="profanity">
                              <Grid item lg={12} md={12} xs={12}>
                                {profanity.questionTitle}{" "}
                                {profanity.questionBody}
                              </Grid>
                              <Grid item lg={12} md={12} xs={12}>
                                {profanity.dateTime}
                              </Grid>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </div>
          )}
        </div>
      )}

      {publicView && (
        <div>
          <Fab aria-label="back" onClick={handlePublicBack}>
            <ArrowBackIosIcon />
          </Fab>
          <Card>
            <h5>Group Description</h5>
            <hr />
            <p>group description</p>
            <Button variant="outlined" onClick={showJoinForm}>
              Join Group
            </Button>
          </Card>

          <Card>
            <h5>Group Info</h5>
            <hr />
            <p>Start Date</p>
            <p>End Date</p>
            <p>Teacher</p>
          </Card>
        </div>
      )}

      {joinForm && (
        <div>
          <form onSubmit={handleSubmit}>
            <TextField
              id="outlined-password-input"
              label="Group Password"
              type="password"
              onChange={(e) => setGroupPass(e.target.value)}
            />
            <Button variant="outlined" type="submit">
              Join Group
            </Button>
          </form>
          <Button variant="outlined" onClick={cancelJoin}>
            Cancel
          </Button>
        </div>
      )}

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Copied to clipboard"
        action={action}
      />

      <Grid lg={12} item container spacing={2}>
        <Grid item lg={12} md={12} xs={12}>
          <Fab aria-label="back" onClick={handleBack} id="btn">
            <HomeIcon />
          </Fab>

          {creatorSettings && (
            <Fab aria-label="groupSettings" onClick={clickSettings} id="btn">
              <SettingsIcon />
            </Fab>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default SelectedGroup;
