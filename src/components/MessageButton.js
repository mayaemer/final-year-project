import Fab from "@mui/material/Fab";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import {
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  Paper,
  InputBase,
  IconButton,
  ListItemButton,
  TextField,
  ListItemText,
  Grid,
  SwipeableDrawer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Send from "@mui/icons-material/Send";
import { useState, useEffect, useRef } from "react";
import Axios from "axios";
import "../styles/Messages.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ChatBubble from "./ChatBubble";

function MessageButton(props) {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState({
    messages: true,
    search: false,
    selectedUser: false,
    showPrevMessages: false,
    noPrevMessages: false,
  });
  const [usersContacts, setUsersContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const [message, setMessage] = useState("");
  const [chatData, setChatData] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [previousChats, setPreviousChats] = useState([]);

  const scrollEnd = useRef(null);

  const scrollToEnd = () => {
    scrollEnd.current?.scrollIntoView();
  };

  const openDrawer = () => {
    setOpen(true);
    getUsersContacts();
    setCurrentUser(props.currentUser);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  const openSelected = (e) => {
    const email = e.target.id;
    const filteredUser = searchResults.filter(
      (contact) => contact.email === email
    );
    setSelectedUser(filteredUser);

    const participants = [...filteredUser];
    participants.push(currentUser);

    //console.log(chatData)
    if (chatData.length === 0) {
      createChat(participants);
    } else {
      console.log(chatData);
      const checkedArr = [];
      chatData.forEach((chat) => {
        const check = checkEqual(chat.participants, participants);
        checkedArr.push(check);
      });

      if (checkedArr.includes(true)) {
        for (let i = 0; i < checkedArr.length; i++) {
          if (checkedArr[i] === true) {
            //console.log(chatData[i])
            setCurrentChat(chatData[i]);
            if (chatData[i].messages.length > 0) {
              setDisplay({
                ...display,
                search: false,
                selectedUser: true,
                showPrevMessages: true,
              });
            } else if (chatData[i].messages.length === 0) {
              setDisplay({
                ...display,
                search: false,
                selectedUser: true,
                noPrevMessages: true,
              });
            }
          }
        }
      } else if (!checkedArr.includes(true)) {
        createChat(participants);
        setDisplay({
          ...display,
          search: false,
          selectedUser: true,
          noPrevMessages: true,
        });
      }
    }
  };

  function checkEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((obj1) => {
      return arr2.some((obj2) => JSON.stringify(obj1) === JSON.stringify(obj2));
    });
  }

  const createChat = (participants) => {
    const data = {
      participants: participants,
    };

    Axios.post("http://localhost:3001/createChat", data)
      .then((res) => {
        console.log(res);
        setCurrentChat(res.data);
        getUsersChats(currentUser.email);
      })
      .catch((e) => console.error(e));
  };

  const closeSelected = () => {
    setDisplay({
      ...display,
      search: true,
      selectedUser: false,
    });
  };

  const sendMessage = () => {
    const data = {
      sender: currentUser,
      receiver: selectedUser,
      message: message,
      chat: currentChat._id,
    };

    Axios.post("http://localhost:3001/sendMessage", data)
      .then((res) => {
        console.log(res);
        getUpdatedChat(currentChat._id);
        setMessage("");
        scrollToEnd();
        setDisplay({
          ...display,
          noPrevMessages: false,
        });
      })
      .catch((e) => console.error(e));
  };

  const getUpdatedChat = (chatid) => {
    const data = {
      id: chatid,
    };

    Axios.post("http://localhost:3001/getUpdatedChat", data)
      .then((res) => {
        console.log(res);
        setCurrentChat(res.data);
      })
      .catch((e) => console.error(e));
  };

  const getUsersContacts = () => {
    const userContactsArr = [];
    props.groups.forEach((group) => {
      if (
        userContactsArr.includes(group.creator) === false &&
        group.creator.email != currentUser.email
      ) {
        userContactsArr.push(group.creator);
        //console.log(group.creator)
      }
      group.members.forEach((member) => {
        if (
          userContactsArr.includes(member) === false &&
          member.email != currentUser.email
        ) {
          userContactsArr.push(member);
        }
      });
      setUsersContacts(userContactsArr);
    });
  };

  const handleSearch = (searchItem) => {
    const results = usersContacts.filter(
      (item) =>
        item.fname.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.sname.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.email.toLowerCase().includes(searchItem.toLowerCase())
    );
    setSearchResults(results);
    setDisplay({
      search: true,
      messages: false,
    });
    if (!searchItem) {
      setSearchResults([]);
      setDisplay({
        search: false,
        messages: true,
      });
    }
  };

  const checkUser = async () => {
    await Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        setCurrentUser({
          email: response.data.user._id,
          fname: response.data.user.Fname,
          sname: response.data.user.Sname,
        });
        const userEmail = response.data.user._id;
        getUsersChats(userEmail);
      } else {
        console.log(response);
      }
    });
  };

  const getUsersChats = (uid) => {
    //console.log(uid)
    const data = {
      userid: uid,
    };
    Axios.post("http://localhost:3001/getChats", data)
      .then((response) => {
        setChatData(response.data);
        console.log(response);
        const data = response.data;
        const particpantArr = [];
        data.forEach((chat) => {
          chat.participants.forEach((participant) => {
            if (participant.email != uid) {
              particpantArr.push(participant);
            }
          });
        });
        setPreviousChats(particpantArr);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    // Scroll to the bottom of the list on initial render
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  }, []);

  useEffect(() => {
    let unmounted = false;
    console.log("Fetching data");
    setTimeout(() => {
      console.log("Data successfully loaded");

      if (!unmounted) {
        checkUser();
      }
    }, 0);

    return () => {
      unmounted = true;
    };
  }, []);

  return (
    <div>
      <Fab aria-label="back" id="return" onClick={openDrawer}>
        <ChatBubbleOutlineIcon />
      </Fab>

      <SwipeableDrawer
        anchor="right"
        onClose={closeDrawer}
        open={open}
        id="drawer"
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 350 },
        }}
      >
        <Paper>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for user.."
            onChange={(e) => handleSearch(e.target.value)}
          ></InputBase>
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Paper>

        {display.search && (
          <List>
            {searchResults.map((contact) => (
              <ListItem disablePadding>
                <ListItemButton id={contact.email} onClick={openSelected}>
                  {contact.fname} {contact.sname}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        {display.selectedUser && (
          <List style={{ height: "100%", overflowY: "auto" }}>
            <ListItem>
              <IconButton onClick={closeSelected}>
                <ArrowBackIosIcon></ArrowBackIosIcon>
              </IconButton>
            </ListItem>
            {selectedUser.map((user) => (
              <ListItem>
                <ListItemText>
                  {user.fname} {user.sname}
                </ListItemText>
              </ListItem>
            ))}
            <List id="chatBody">
              {display.noPrevMessages && (
                <Grid container direction="column">
                  <p>No previous messages</p>
                </Grid>
              )}
              {display.showPrevMessages && (
                <Grid container direction="column">
                  {currentChat.messages.map((message) => (
                    <ChatBubble
                      message={message.message}
                      isCurrentUser={message.sender.email === currentUser.email}
                      time={message.time}
                      date={message.date}
                    />
                  ))}
                  <div id="dummy" ref={scrollEnd}>test test test</div>
                </Grid>
              )}
            </List>
            <ListItem id="sendMessage">
              <TextField
                fullWidth
                id="outlined-multiline-static"
                multiline
                rows={4}
                placeholder="Write a message.."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <IconButton onClick={sendMessage}>
                <Send />
              </IconButton>
            </ListItem>
          </List>
        )}
        {display.messages && (
          <List>
            {previousChats.map((chat) => (
              <ListItemButton>
                {chat.fname} {chat.sname}
              </ListItemButton>
            ))}
          </List>
        )}
      </SwipeableDrawer>
    </div>
  );
}

export default MessageButton;
