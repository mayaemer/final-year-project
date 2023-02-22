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
import { TextField } from "@mui/material";
import Refresh from "../components/Refresh";
import {
  updateGroupNameSchema,
  updatePassSchema,
} from "../Validations/Validation";

function SelectedGroup() {
  let { selectedGroup } = useParams();

  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");

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
  const [publicView, setPublicView] = useState(true);
  const [joinForm, setJoinForm] = useState(false);
  const [creatorSettings, setCreatorSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBtn, setDeleteBtn] = useState(true);

  const [groupPass, setGroupPass] = useState("");
  const [deletePass, setDeletePass] = useState("");

  Axios.defaults.withCredentials = true;

  const getGroupData = () => {
    const data = { ID: selectedGroup };
    Axios.post("http://localhost:3001/groupInfo", data).then((res) => {
      setGroupInfo(res.data);
      setGroupName(res.data.groupName);
      $("#groupTitle").css("background-image", "url(" + res.data.image + ")");
      checkUser(res.data.members, res.data.creator);
    });
  };

  const checkUser = (members, creator) => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setEmail(response.data.user._id);
        const user = response.data.user._id;
        if (members.includes(user) === true) {
          setMembersView(true);
          setPublicView(false);
        } else if (creator === user) {
          setMembersView(true);
          setPublicView(false);
          setCreatorSettings(true);
        } else {
          setMembersView(false);
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
      setGroupInfo(false);
      setMembersVisible(false);
    }
  };

  const handleBack = () => {
    navigate("/Groups");
  };

  const handleGroupInfo = () => {
    if (infoVisible === true) {
      setInfoVisible(false);
    } else {
      setInfoVisible(true);
      setMembersVisible(false);
    }
  };

  const handleMembers = () => {
    if (membersVisible === true) {
      setMembersVisible(false);
    } else {
      setMembersVisible(true);
      setInfoVisible(false);
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
      user: email,
      group: selectedGroup,
      password: groupPass,
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
    console.log(data);
    Axios.post("http://localhost:3001/deleteGroup", data)
      .then((res) => console.log(res))
      .then((result) => navigate("/Groups"))
      .catch((e) => console.log(e));
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
          <Fab aria-label="back" onClick={handleBack}>
            <ArrowBackIosIcon />
          </Fab>
          {creatorSettings && (
            <Fab aria-label="groupSettings" onClick={clickSettings}>
              <SettingsIcon />
            </Fab>
          )}
          {mainVisible && (
            <Card id="groupCard">
              <Grid lg={12} item container spacing={2}>
                <Grid item lg={3} md={3} xs={6}>
                  <Link to={"/content"} id="contentLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Content</p>
                    </Paper>
                  </Link>
                </Grid>
                <Grid item lg={3} md={3} xs={6}>
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
                <Grid item lg={3} md={3} xs={6}>
                  <Link to={"/polls"} id="pollsLink">
                    <Paper id="paperOption">
                      <img
                        id="paperImage"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGyea252bkYoYgpPi52T2_kjlNBy5lMjmM-w&usqp=CAU"
                      />
                      <p id="paperName">Polls</p>
                    </Paper>
                  </Link>
                </Grid>
                <Grid item lg={3} md={3} xs={6}>
                  <Link to={"/quiz"} id="quizLink">
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
                      <MenuItem>Restricted Users</MenuItem>
                    </MenuList>
                  </Card>
                </Grid>

                {infoVisible && (
                  <Grid item lg={9} md={9} xs={12} id="test">
                    <Card id="groupSettings">
                      <Grid lg={12} item container spacing={2}>
                        <Grid item lg={12} md={12} xs={12} id="title">
                          <h4>Group Information Settings</h4>
                        </Grid>
                        <Grid item lg={4} md={4} xs={12} id="id">
                          <p>Group ID</p>
                        </Grid>
                        <Grid item lg={5} md={8} xs={12} id="id">
                          <p>{groupInfo._id}</p>
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
                              <button onClick={handleEditName}>Edit</button>
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
                              <button id="editBtn" onClick={saveUpdate}>
                                Save
                              </button>
                              <button id="editBtn" onClick={cancelNameUpdate}>
                                Cancel
                              </button>
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
                              <p>{groupInfo.password}</p>
                            </Grid>

                            <Grid item lg={6} md={6} xs={12}>
                              <button onClick={handleEditPass}>Edit</button>
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
                              <button id="editBtn" onClick={saveUpdatedPass}>
                                Save
                              </button>
                              <button id="editBtn" onClick={cancelPassUpdate}>
                                Cancel
                              </button>
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
                            <button onClick={showConfirmDelete}>
                              Delete Group
                            </button>
                          </Grid>
                        </Grid>
                      )}

                      {confirmDelete && (
                        <Grid lg={8} item container id="test">
                          <Grid item lg={6} md={6} xs={12} id="text">
                            <TextField
                              id="outlined-basic"
                              variant="outlined"
                              label="Enter password to confirm deletion"
                              onChange={(e) => setDeletePass(e.target.value)}
                            />
                          </Grid>

                          <Grid item lg={6} md={6} xs={12}>
                            <button onClick={handleDelete}>Delete</button>
                          </Grid>
                        </Grid>
                      )}
                    </Card>
                  </Grid>
                )}

                {membersVisible && (
                  <Grid item lg={9} md={9} xs={6}>
                    <Card id="groupSettings">
                      <Grid lg={12} item container spacing={2}>
                        <Grid item lg={12} md={12} xs={12}>
                          <h4>Group Members</h4>
                        </Grid>
                      </Grid>
                      {groupInfo.members.map((member) => (
                        <p>{member}</p>
                      ))}
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
            <button onClick={showJoinForm}>Join Group</button>
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
            <button type="submit">Join Group</button>
          </form>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default SelectedGroup;
