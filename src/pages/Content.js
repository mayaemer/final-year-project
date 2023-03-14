import { useEffect, useState, useRef } from "react";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import $ from "jquery";
import { useParams } from "react-router-dom";
import {
  Card,
  Grid,
  IconButton,
  TextField,
  Button,
  Alert,
  Paper,
  Breadcrumbs,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
} from "@mui/material";
import BackButton from "../components/BackButton";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Form from "react-bootstrap/Form";
import { Spinner } from "react-bootstrap";
import Refresh from "../components/Refresh";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import CloseIcon from "@mui/icons-material/Close";
import { Delete, Settings } from "@mui/icons-material";

function Content() {
  Axios.defaults.withCredentials = true;

  const [groupInfo, setGroupInfo] = useState([]);
  const [contentInfo, setContentInfo] = useState([]);
  const [contentDisplay, setContentDisplay] = useState({
    main: true,
    none: false,
    contentSelection: false,
    uploadForm: false,
    loading: false,
    success: false,
    fail: false,
    showSelectedContent: false,
    showSelectedFile: false,
    confirmDelete: false,
  });
  const [view, setView] = useState({
    teacher: false,
    user: false,
  });
  const [accountEmail, setAccountEmail] = useState("");
  const [filesArr, setFilesArr] = useState([]);
  const [contentTitle, setContentTitle] = useState("");
  const [selectedContent, setSelectedContent] = useState({
    title: "",
  });
  const [selectedFile, setSelectedFile] = useState({
    originalname: "",
  });
  const [deleteItem, setDeleteItem] = useState("");
  const [docs, setDocs] = useState();

  const navigate = useNavigate();
  const fileSelect = useRef(null);
  let { groupId } = useParams();

  const selectBreadcrumb = (e) => {
    const selected = e.target.name;
    if (selected === "content") {
      setContentDisplay({
        ...contentDisplay,
        contentSelection: true,
        showSelectedContent: false,
        showSelectedFile: false,
        main: true,
      });
    } else if (selected === "selectedContent") {
      setContentDisplay({
        ...contentDisplay,
        contentSelection: false,
        showSelectedContent: true,
        showSelectedFile: false,
        main: false,
      });
    }
  };

  const breadcrumbs = [
    <Link
      underline="hover"
      name="content"
      color="inherit"
      onClick={selectBreadcrumb}
    >
      Content
    </Link>,
    <Link
      underline="hover"
      name="selectedContent"
      color="inherit"
      href="/material-ui/getting-started/installation/"
      onClick={selectBreadcrumb}
    >
      {selectedContent.title}
    </Link>,
    <Typography key="3" color="text.primary">
      {selectedFile.originalname}
    </Typography>,
  ];

  const handleMenuSelect = (e) => {
    const selectedContent = e.currentTarget.id;
    contentInfo.forEach((content) => {
      content.forEach((item) => {
        if (item["_id"] === selectedContent) {
          setSelectedContent(item);
        }
      });
    });
  };

  const confirmDelete = (e) => {
    setDeleteItem(e.target.id);
    setContentDisplay({
      confirmDelete: true,
      showSelectedContent: false,
      showSelectedFile: false,
    });
  };

  const deleteContent = () => {
    const fileId = selectedFile.filename;
    const data = {
      contentid: selectedContent._id,
      filename: fileId,
    };

    //console.log(selectedContent);
    Axios.post("http://localhost:3001/deleteContent", data)
      .then((response) => {
        console.log(response);
        Refresh();
      })
      .catch((e) => console.error(e));
  };

  const cancelDelete = () => {
    setContentDisplay({
      ...contentDisplay,
      showSelectedContent: true,
      confirmDelete: false,
    });
  };

  const showFile = (e) => {
    e.preventDefault();
    const selectedFile = e.target.id;
    setContentDisplay({
      ...selectedContent,
      showSelectedContent: false,
      showSelectedFile: true,
    });
    //console.log(selectedContent['files'])
    selectedContent["files"].forEach((file) => {
      if (file["filename"] === selectedFile) {
        setSelectedFile(file);
        setDocs([{ uri: require("/server/uploads/" + file.filename) }]);
      }
    });
  };

  const handleSelect = (e) => {
    const selectedContent = e.target.className;
    //console.log(selectedContent);
    contentInfo.forEach((content) => {
      content.forEach((item) => {
        if (item["_id"] === selectedContent) {
          setSelectedContent(item);
        }
      });
    });

    setContentDisplay({
      ...contentDisplay,
      contentSelection: false,
      showSelectedContent: true,
      main: false,
    });
  };

  const handleOk = () => {
    Refresh();
  };

  const openForm = () => {
    setContentDisplay({
      ...contentDisplay,
      main: false,
      uploadForm: true,
      contentSelection: false,
      none: false,
    });
  };

  const closeForm = () => {
    if (contentInfo.length > 0) {
      setContentDisplay({
        ...contentDisplay,
        main: true,
        contentSelection: true,
        uploadForm: false,
        showSelectedContent: false,
      });
    } else if (contentInfo.length === 0) {
      setContentDisplay({
        ...contentDisplay,
        main: true,
        none: true,
        uploadForm: false,
        showSelectedContent: false,
      });
    }
  };

  const closeFile = () => {
    setContentDisplay({
      ...contentDisplay,
      showSelectedContent: true,
      showSelectedFile: false,
    });
  };

  const uploadContent = async (e) => {
    const formData = new FormData();
    //console.log(filesArr.length);
    if (filesArr.length == 0) {
      alert("No files selected. Please select a file to upload.");
    } else {
      setContentDisplay({
        ...contentDisplay,
        uploadForm: false,
        loading: true,
      });
      formData.append("title", contentTitle);
      formData.append("groupId", groupId);
      formData.append("creator", accountEmail);
      filesArr.forEach((file) => {
        formData.append("files", file.file);
      });

      fileSelect.current.value = null;

      sendContent(formData);
    }
  };

  const sendContent = (formData) => {
    setTimeout(() => {
      Axios.post("http://localhost:3001/upload", formData)
        .then((res) => {
          console.log(res);
          setContentDisplay({
            ...contentDisplay,
            uploadForm: false,
            loading: false,
            success: true,
          });
        })
        .catch((e) => console.error(e));
    }, 2000);
  };

  // save files selected for upload to array
  const saveFile = (e) => {
    Object.keys(e.target.files).forEach((key) => {
      setFilesArr((arr) => [...arr, { file: e.target.files[key] }]);
    });
  };

  const getContent = () => {
    const data = {
      ID: groupId,
    };
    Axios.post("http://localhost:3001/getContent", data).then((res) => {
      if (res.data.length === 0) {
        setContentDisplay({
          ...contentDisplay,
          none: true,
        });
      } else if (res.data.length > 0) {
        setContentDisplay({
          ...contentDisplay,
          contentSelection: true,
        });
        setContentInfo([res.data]);
      }
      console.log(res);
    });
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
        setAccountEmail(response.data.user._id);
        const accountEmail = response.data.user._id;
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
      setView({
        ...view,
        teacher: true,
      });
    } else if (usertype === "Student") {
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
        navigate("/Content/" + groupId);
      } else {
        navigate("/");
      }
      let unmounted = false;
      console.log("Fetching data");
      setTimeout(() => {
        console.log("Data successfully loaded");

        if (!unmounted) {
          getGroupData();
          getContent();
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

      <Grid>
        <Card id="groupCard">
          <Grid lg={12} item container spacing={2}>
            <Grid item lg={12} md={12} xs={12}>
              {contentDisplay.main && <h2 id="header">Content</h2>}
              {contentDisplay.showSelectedContent && (
                <h2 id="header">{selectedContent.title}</h2>
              )}
            </Grid>

            {contentDisplay.main && (
              <Grid item lg={1} md={1} xs={1} id="btnSection">
                <BackButton destination={"group/" + groupId}></BackButton>
              </Grid>
            )}
            {contentDisplay.showSelectedContent && (
              <Grid item lg={1} md={1} xs={1} id="btnSection">
                <IconButton
                  aria-label="addGroup"
                  onClick={closeForm}
                  id="formBtn"
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            )}
            {contentDisplay.showSelectedFile && (
              <Grid item lg={1} md={1} xs={1} id="btnSection">
                <IconButton
                  aria-label="addGroup"
                  onClick={closeFile}
                  id="formBtn"
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            )}
            {view.teacher && (
              <Grid item lg={1} md={1} xs={1} id="btnSection">
                {contentDisplay.main && (
                  <IconButton
                    aria-label="addGroup"
                    onClick={openForm}
                    id="formBtn"
                  >
                    <AddIcon />
                  </IconButton>
                )}
                {contentDisplay.showSelectedContent && (
                  <IconButton
                    aria-label="addGroup"
                    id="content"
                    onClick={confirmDelete}
                  >
                    <Delete></Delete>
                  </IconButton>
                )}
                {contentDisplay.showSelectedFile && (
                  <IconButton
                    aria-label="addGroup"
                    id="file"
                    onClick={confirmDelete}
                  >
                    <Delete></Delete>
                  </IconButton>
                )}
              </Grid>
            )}

            {contentDisplay.main && (
              <Grid Grid item lg={12} md={12} xs={12} id="main">
                {contentDisplay.none && (
                  <Grid item lg={12} md={12} xs={12}>
                    <h5>No content available.</h5>
                  </Grid>
                )}
              </Grid>
            )}

            {contentDisplay.contentSelection && (
              <Grid lg={12} item container spacing={2} id="contentSection">
                {contentInfo.map((content) => (
                  <Grid lg={12} item container spacing={2}>
                    {content.map((item) => (
                      <Grid item lg={3} md={3} xs={6}>
                        <Paper
                          id="paperOption"
                          className={item["_id"]}
                          onClick={handleSelect}
                        >
                          <img
                            id="paperImage"
                            className={item["_id"]}
                            src="https://cdn.pixabay.com/photo/2015/11/02/18/32/water-1018808__340.jpg"
                          />
                          <p id="paperName" className={item["_id"]}>
                            {item["title"]}
                          </p>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ))}
              </Grid>
            )}

            {contentDisplay.showSelectedContent && (
              <Grid lg={12} item container id="contentBody">
                <Grid item lg={4} md={4} xs={12}>
                  {contentInfo.map((content) => (
                    <List id="menu">
                      {content.map((item) => (
                        <ListItem
                          style={{
                            backgroundColor:
                              selectedContent.title === item.title
                                ? "#bdbebf"
                                : "#edeff2",
                            cursor: "pointer",
                          }}
                          id={item["_id"]}
                          onClick={handleMenuSelect}
                        >
                          <ListItemButton>{item["title"]}</ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  ))}
                </Grid>
                <Grid item lg={8} md={8} xs={12}>
                  <List>
                    {selectedContent["files"].map((file) => (
                      <ListItem id="listItem">
                        <Link id={file["filename"]} onClick={showFile}>
                          <p id={file["filename"]}>{file["originalname"]}</p>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}

            {contentDisplay.confirmDelete && (
              <Grid>
                <p>Please confirm to delete selected item.</p>
                <Button variant="outlined" onClick={deleteContent}>
                  Confirm
                </Button>
                <Button variant="outlined" onClick={cancelDelete}>
                  Cancel
                </Button>
              </Grid>
            )}

            {contentDisplay.showSelectedFile && (
              <Grid lg={12} item container>
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                >
                  {breadcrumbs}
                </Breadcrumbs>
                <Grid lg={12} item container>
                  <h3>{selectedFile.originalname}</h3>
                </Grid>
                <DocViewer
                  documents={docs}
                  pluginRenderers={DocViewerRenderers}
                  config={{
                    header: {
                      disableHeader: false,
                      disableFileName: true,
                      retainURLParams: false,
                    },
                  }}
                />
              </Grid>
            )}

            {contentDisplay.uploadForm && (
              <Grid item lg={12} md={12} xs={12}>
                <TextField
                  id="outlined-basic"
                  label="Content Title"
                  variant="outlined"
                  className="form"
                  onChange={(e) => setContentTitle(e.target.value)}
                />
                <Form.Label>Select files to be uploaded </Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  ref={fileSelect}
                  onChange={saveFile}
                />
                <Button variant="outlined" onClick={uploadContent}>
                  Upload
                </Button>
                <Button variant="outlined" onClick={closeForm}>
                  Cancel
                </Button>
              </Grid>
            )}

            {contentDisplay.loading && (
              <Grid>
                <p>Uploading content..</p>
                <Spinner></Spinner>
              </Grid>
            )}

            {contentDisplay.success && (
              <Grid>
                <Alert severity="success">
                  Content successfully uploaded.{" "}
                  <Button onClick={handleOk}>Ok</Button>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Content;