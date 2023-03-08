import NavBar from "../components/NavBar";
import React from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();


  const checkUser = () => {
    Axios.get("http://localhost:3001/check").then((response) => {
      if (response.data.loggedIn === true) {
        console.log('User logged in')
      }
    });
  };

  React.useEffect(() => {
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
            checkUser();
        }
      }, 0);

      return () => {
        unmounted = true;
      };
    }, []);
  }, []);

  return <NavBar></NavBar>;
}

export default Home;
