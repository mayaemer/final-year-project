import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import "../styles/Groups.css";
import RemoveIcon from "@mui/icons-material/Remove";
import { TextField } from "@mui/material";
import Refresh from "../components/Refresh";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { createGroupSchema } from "../Validations/Validation";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import $ from "jquery";
import formatItem from "../functions/helper.js";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import Spinner from "react-bootstrap/Spinner";
import MessageButton from "../components/MessageButton";

function Groups() {
  const navigate = useNavigate();

  const [buttonVisibility, setButtonVisibility] = useState(false);
  const [closeButton, setCloseButton] = useState(false);
  const [usersGroups, setUsersGroups] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [nextForm, setNextForm] = useState(false);
  const [groupSection, setGroupSection] = useState(true);
  const [creatingSpinner, setCreatingSpinner] = useState({
    loading: false,
    area: false,
    success: false,
    error: false,
  });
  //const [accountEmail, setAccountEmail] = useState("");
  const [currentUser, setCurrentUser] = useState({
    email: "",
    fname: "",
    sname: "",
  });

  const [groupName, setGroupName] = useState("");
  const [groupPass, setGroupPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [groupImage, setGroupImage] = useState({
    image: "https://allea.org/wp-content/uploads/2020/10/science-education.jpg",
    title: "Educational Image",
  });

  const [formError, setFormError] = useState(false);

  const [groupList, seGroupList] = useState([]);

  const matches = useMediaQuery("(min-width:600px)");

  const imageSelection = [
    {
      title: "Educational",
      img: "https://allea.org/wp-content/uploads/2020/10/science-education.jpg",
    },
    {
      title: "Claude Monet Water Lillies",
      img: "https://www.artfixdaily.com/images/fl/July27_SLAM_21500x705.jpg",
    },
    {
      title: "Nature Image",
      img: "https://wallpapershome.com/images/pages/pic_h/16081.jpg",
    },
    {
      title: "Yayoi Kusama Infinity Room",
      img: "https://www.thebroad.org/sites/default/files/styles/broad_heading_hero/public/images/kusama_the_souls_of_millions_1%20%282%29.jpg?itok=LYQTUOVU",
    },
    {
      title: "Jellyfish Image",
      img: "https://i.icanvas.com/list-hero/jellyfish.jpg",
    },
    {
      title: "Nature Image",
      img: "https://wallpaperaccess.com/full/1384481.jpg",
    },
    {
      title: "Dock Image",
      img: "https://wallpapercave.com/wp/wp3085445.jpg",
    },
    {
      title: "Mountains Image",
      img: "https://wallpaperaccess.com/full/974541.jpg",
    },
    {
      title: "Fire Image",
      img: "https://wallpaperaccess.com/full/1349207.jpg",
    },
    {
      title: "Grass Image",
      img: "https://wallpapershome.com/images/pages/pic_h/4708.jpg",
    },
    {
      title: "Lights Image",
      img: "https://i.ytimg.com/vi/XgOov36UzjQ/maxresdefault.jpg",
    },
    {
      title: "Space Image",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQpibJhQNICnet6gBbrGr0kcYjBT9MkGo0lw&usqp=CAU",
    },
  ];
  Axios.defaults.withCredentials = true;

  const checkUserType = async () => {
    await Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setCurrentUser({
          email: response.data.user._id,
          fname: response.data.user.Fname,
          sname: response.data.user.Sname,
        });
        const accountEmail = response.data.user._id;
        //console.log(accountEmail)
        if (response.data.user.UserType === "Teacher") {
          setButtonVisibility(true);
          checkGroups(accountEmail, "Teacher");
        } else if (response.data.user.UserType === "Student") {
          setButtonVisibility(false);
          checkGroups(accountEmail, "Student");
        }
      } else {
        console.log(response);
      }
    });
  };

  const checkGroups = (email, usertype) => {
    const data = { Email: email, Usertype: usertype };
    Axios.post("http://localhost:3001/checkGroup", data).then((res) => {
      if (res.data.length === 0) {
        setUsersGroups("You do not have any groups.");
      } else {
        //console.log(res.data)
        seGroupList(res.data);
      }
    });
  };

  const selectImage = (e) => {
    setGroupImage({
      ...groupImage,
      image: e.target.id,
      title: e.target.name,
    });

    imageSelection.forEach((image) => {
      if (image.img === e.target.id) {
        const imgurl = "#" + formatItem(image.img);
        $(imgurl).css("border", "3px solid blue");
      } else {
        const imgurl = "#" + formatItem(image.img);
        $(imgurl).css("border", "none");
      }
    });
  };

  const openCreateForm = () => {
    setButtonVisibility(false);
    setOpenForm(true);
    setCloseButton(true);
    setGroupSection(false);
  };

  const closeForm = () => {
    setButtonVisibility(true);
    setOpenForm(false);
    setCloseButton(false);
    setGroupSection(true);
    setNextForm(false);
    setCreatingSpinner({
      ...creatingSpinner,
      loading: false,
      area: false,
      success: false,
      error: false,
    });
  };

  const moveToNext = async () => {
    const groupData = {
      GroupName: groupName,
      Password: groupPass,
      Confirm: confirmPass,
    };

    const validate = await createGroupSchema.isValid(groupData);

    if (validate === true) {
      setNextForm(true);
      setOpenForm(false);
    } else {
      setFormError(true);
    }
  };

  const createGroup = (e) => {
    e.preventDefault();

    const groupData = {
      GroupName: groupName,
      Password: groupPass,
      Confirm: confirmPass,
      creator: currentUser,
      Image: groupImage,
    };
    setNextForm(false);
    setCreatingSpinner({
      ...creatingSpinner,
      loading: true,
      area: true,
      success: false,
      error: false,
    });
    setTimeout(
      () =>
        Axios.post("http://localhost:3001/createGroup", groupData)
          .then((response) => {
            console.log(response);
            setCreatingSpinner({
              ...creatingSpinner,
              loading: false,
              area: true,
              success: true,
              error: false,
            });
          })
          .catch((e) => {
            console.log(e);
            setCreatingSpinner({
              ...creatingSpinner,
              loading: false,
              area: true,
              success: false,
              error: true,
            });
          }),
      2000
    );
  };

  const handleOk = () => {
    setFormError(false);
    setCreatingSpinner({
      ...creatingSpinner,
      loading: false,
      area: false,
      success: false,
      error: false,
    });
    Refresh();
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/isAuthenticated", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      const authenticated = response.data;
      if (authenticated === true) {
        navigate("/Home");
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          checkUserType();
          const defaultUrl = "#" + formatItem(groupImage.image);
          $(defaultUrl).css("border", "3px solid blue");
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
      <Grid lg={12} item container spacing={2}>
        <Grid item lg={10} md={10} xs={10} id="welcome">
          {groupSection && (
            <h2 id="welcomeText">Welcome {currentUser.fname}!</h2>
          )}
        </Grid>
        <Grid item lg={2} md={2} xs={2} id="messageBtn">
          <MessageButton
            currentUser={currentUser}
            groups={groupList}
            id="messageBtn"
          />
        </Grid>
      </Grid>
      {groupSection && (
        <Card id="groupsCard" className="home">
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              {buttonVisibility && (
                <IconButton
                  aria-label="addGroup"
                  onClick={openCreateForm}
                  id="formBtn"
                >
                  <AddIcon />
                </IconButton>
              )}
              <h4>My Groups</h4>
            </Grid>
            <hr />
            <Grid item lg={12} md={12} xs={12}>
              <h3>{usersGroups}</h3>
            </Grid>
            {groupList.map((groups) => (
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
      )}

      {openForm && (
        <Card id="groupsCard">
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              {closeButton && (
                <IconButton
                  aria-label="addGroup"
                  onClick={closeForm}
                  id="formBtn"
                >
                  <RemoveIcon />
                </IconButton>
              )}
              <h4>Create Group</h4>
            </Grid>
            <hr />

            <Grid item lg={12} md={12} xs={12}>
              <TextField
                id="outlined-basic"
                label="Group Name"
                variant="outlined"
                className="form"
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <TextField
                id="outlined-multiline-static"
                label="Description"
                multiline
                rows={4}
                className="form"
                placeholder="Write a description.."
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                className="form"
                onChange={(e) => setGroupPass(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <TextField
                id="outlined-password-input"
                label="Confirm Password"
                type="password"
                className="form"
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <Button type="submit" variant="outlined" onClick={moveToNext}>
                Next
              </Button>
            </Grid>
            {formError && (
              <Grid item lg={12} md={12} xs={12}>
                <Alert severity="error" id="invalid">
                  <p>Data not valid! </p>
                  <p>- Please ensure all sections are filled out.</p>
                  <p>
                    - Passwords must contain 8 characters, one uppercase, one
                    lowercase, one number and one special case character.
                  </p>
                  <p>- Please ensure that your passwords match.</p>
                  <Button variant="outlined" onClick={handleOk}>
                    Ok
                  </Button>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {nextForm && (
        <Card id="groupsCard">
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              {closeButton && (
                <IconButton
                  aria-label="addGroup"
                  onClick={closeForm}
                  id="formBtn"
                >
                  <RemoveIcon />
                </IconButton>
              )}
              <h4>Create Group</h4>
              <h6>Please select an image</h6>
            </Grid>
            <hr />

            <Grid item lg={12} md={12} xs={12}>
              <form onSubmit={createGroup} className="imageForm">
                <ImageList
                  id="imageSelection"
                  variant="masonry"
                  cols={matches ? 3 : 2}
                  rowHeight={164}
                >
                  {imageSelection.map((image) => (
                    <ImageListItem key={image.img}>
                      <img
                        src={`${image.img}?w=164&h=164&fit=crop&auto=format`}
                        srcSet={`${image.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                        alt={image.title}
                        loading="lazy"
                        id={image.img}
                        name={image.title}
                        onClick={selectImage}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
                <Grid item lg={12} md={12} xs={12}>
                  <Alert severity="info" className="selectedImg">
                    Selected Image: {groupImage.title}
                  </Alert>
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                  <Button type="submit" variant="outlined">
                    Create
                  </Button>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Card>
      )}

      {creatingSpinner.area && (
        <Card id="groupsCard">
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              <h4>Create Group</h4>
            </Grid>
            {creatingSpinner.loading && (
              <Grid item lg={12} md={12} xs={12}>
                <Spinner></Spinner>
                <p> Creating group..</p>
              </Grid>
            )}
            {creatingSpinner.success && (
              <Grid item lg={12} md={12} xs={12}>
                <Alert severity="success" id="resultAlert">
                  Group successfully created.{" "}
                  <Button variant="outlined" onClick={handleOk}>
                    Ok
                  </Button>
                </Alert>
              </Grid>
            )}
            {creatingSpinner.error && (
              <Grid item lg={12} md={12} xs={12}>
                <Alert severity="error" id="resultAlert">
                  <p id="resultText">Error, group was unable to be created.</p>
                  <Button variant="outlined" onClick={handleOk}>
                    Ok
                  </Button>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Card>
      )}
    </div>
  );
}

export default Groups;
