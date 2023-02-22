import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import "../styles/Groups.css";
import { TextField } from "@mui/material";
import Refresh from "../components/Refresh";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";

function Groups() {
  const navigate = useNavigate();

  const [buttonVisibility, setButtonVisibility] = useState(false);
  const [usersGroups, setUsersGroups] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");

  const [groupName, setGroupName] = useState("");
  const [groupPass, setGroupPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [groupList, seGroupList] = useState([]);

  Axios.defaults.withCredentials = true;

  const checkUserType = async () => {
    await Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setAccountEmail(response.data.user._id);
        const accountEmail = response.data.user._id;
        if (response.data.user.UserType === "Teacher") {
          setButtonVisibility(true);
          checkGroups(accountEmail, 'Teacher');
        } else if (response.data.user.UserType === "Student") {
          setButtonVisibility(false);
          checkGroups(accountEmail, 'Student');
        }
      } else {
        console.log(response)
      }
    });
  };

  const checkGroups = (email, usertype) => {
    const data = { Email: email, Usertype: usertype };
    Axios.post("http://localhost:3001/checkGroup", data).then((res) => {
      if (res.data.length === 0) {
        setUsersGroups("You do not have any groups.");
      } else {
        seGroupList(res.data);
      }
    });
  };

  const openCreateForm = () => {
    if (openForm === true) {
      setOpenForm(false);
    } else if (openForm === false) {
      setOpenForm(true);
    }
  };

  const createGroup = (e) => {
    e.preventDefault();

    const groupData = {
      GroupName: groupName,
      Password: groupPass,
      Confirm: confirmPass,
      Email: accountEmail,
    };

    Axios.post("http://localhost:3001/createGroup", groupData)
      .then((response) => {
        Refresh();
      })
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
        navigate("/Groups");
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          checkUserType();
        }
      }, 0);

      return () => {
        unmounted = true;
      };
    }, []);
  }, []);

  return (
    <div>
      <NavBar></NavBar>
      <Card id="groupsCard">
        <h4>My Groups</h4>
        <hr />
        <h3>{usersGroups}</h3>

        {/* look into overlaying divs */}

        <div id="groupSection">
          {groupList.map((groups) => (
            <Link to={"/group/" + groups._id} id="groupLink">
              <Paper id="groupPaper">
                <img id="groupImage" src={groups.image} />
                <p id="groupName">{groups.groupName}</p>
              </Paper>
            </Link>
          ))}
        </div>
      </Card>

      {buttonVisibility && (
        <IconButton aria-label="addGroup" onClick={openCreateForm}>
          <AddIcon />
        </IconButton>
      )}

      {openForm && (
        <Card id="createForm">
          <h4>Create Group</h4>
          <hr />
          <form onSubmit={createGroup}>
            <TextField
              id="outlined-basic"
              label="Group Name"
              variant="outlined"
              onChange={(e) => setGroupName(e.target.value)}
            />
            <TextField
              id="outlined-password-input"
              label="Password"
              type="password"
              onChange={(e) => setGroupPass(e.target.value)}
            />
            <TextField
              id="outlined-password-input"
              label="Confirm Password"
              type="password"
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <button type="submit">Create</button>
          </form>
        </Card>
      )}
    </div>
  );
}

export default Groups;
