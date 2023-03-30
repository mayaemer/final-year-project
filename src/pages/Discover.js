import NavBar from "../components/NavBar";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import Axios from "axios";
import Card from "@mui/material/Card";
import { Link } from "react-router-dom";
import MessageButton from "../components/MessageButton";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import "../styles/Discover.css";

function Discover() {
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [currentUser, setCurrentUser] = useState();

  Axios.defaults.withCredentials = true;

  const checkUser = () => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        console.log(response);
        setCurrentUser({
          email: response.data.user._id,
          fname: response.data.user.Fname,
          sname: response.data.user.Sname,
        });
        checkGroups(response.data.user._id, response.data.user.UserType);
      }
    });
  };

  const checkGroups = (email, usertype) => {
    const data = { Email: email, Usertype: usertype };
    Axios.post("http://localhost:3001/checkGroup", data).then((res) => {
      {
        setGroupList(res.data);
      }
    });
  };

  const getGroups = async () => {
    await Axios.get("http://localhost:3001/getGroups")
      .then((res) => {
        setGroupData(res.data);
        console.log(res);
      })
      .catch((e) => console.log(e));
  };

  const handleSearch = async (searchItem) => {

    let searchData = {
      searchData: searchItem,
    };

    await Axios.post("http://localhost:3001/searchGroups", searchData)
      .then((res) => {
        setGroupData(res.data);
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
      console.log(authenticated);
      if (authenticated === false) {
        navigate("/");
      }
      let unmounted = false;
      console.log("Running to fetch data");
      setTimeout(() => {
        console.log("Data loaded for page");

        if (!unmounted) {
          getGroups();
          checkUser();
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
      <Grid lg={12} item container>
        <Grid item lg={10} md={10} xs={10}></Grid>

        <Grid item lg={2} md={2} xs={2} id="messageBtn">
          <MessageButton
            currentUser={currentUser}
            groups={groupList}
            id="messageBtn"
          />
        </Grid>
        <Grid item lg={12} md={12} xs={12} id='discoverHead'>
          <h2>Discover</h2>
        </Grid>
        <Grid item lg={12} md={12} xs={12} id='discoverHead'>
          <Paper
            sx={{
              p: "2px 4px",
              width: 800,
            }}
            id="searchBar"
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for group by id.."
            ></InputBase>
            <IconButton>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        <Grid item lg={12} md={12} xs={12}>
          <Card id="groupsCard" className='discover'>
            <Grid lg={12} item container spacing={2} id="testgrid">
              {groupData.map((groups) => (
                <Grid item lg={3} md={3} xs={6}>
                  <Link to={"/group/" + groups._id} id="groupLink">
                    <Paper id="groupPaper">
                      <img id="groupImage" src={groups.image.image} />
                      <p id="groupName">{groups.groupName}</p>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Discover;
