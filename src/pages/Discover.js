import NavBar from "../components/NavBar";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import Axios from "axios";
import Card from "@mui/material/Card";
import { Link } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import "../styles/Groups.css";

function Discover() {
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState([]);

  Axios.defaults.withCredentials = true;

  const checkUser = () => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        console.log(response);
      }
    });
  };

  const getGroups = async () => {
    await Axios.get("http://localhost:3001/getGroups")
      .then((res) => {
        setGroupData(res.data);
        console.log(res.data);
      })
      .catch((e) => console.log(e));
  };

  const handleSearch = async (searchItem) => {
    //console.log(searchItem);

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
        <Grid item lg={12} md={12} xs={12}>
          <h2 id='head'>Discover</h2>
        </Grid>
        <Grid item lg={12} md={12} xs={12} >
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
          <Card id="groupsCard">
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
