import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import { Alert, Button, Grid, TextField } from "@mui/material";
import { loginSchema } from "../Validations/Validation";
import Axios from "axios";
import { useNavigate } from "react-router";
import Refresh from "../components/Refresh";

// this page is empty at this point
function Login() {
  // navigation
  const navigate = useNavigate();

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);

  Axios.defaults.withCredentials = true;

  // authenticates user, if authenticated navigate to home page
  useEffect(() => {
    Axios.get("http://localhost:3001/isAuthenticated", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      const authenticated = response.data;
      if (authenticated === true) {
        navigate("/Home");
      }
    }, []);
  });

  // post login data to server to validate it against database records
  // if successful add token to local storage
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = {
      Email: email,
      Pass: password,
    };

    const validate = await loginSchema.isValid(loginData);

    if (validate === true) {
      setErrorMessage("");
      try {
        Axios.post("http://localhost:3001/login", loginData).then(function (
          res
        ) {
          if (!res.data.auth) {
            setErrorMessage(res.data.message);
            setError(true);
          } else {
            localStorage.setItem("token", res.data.token);
            Refresh();
          }
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setErrorMessage("Data not valid");
      setError(true);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item lg={12} md={12} xs={12}>
        <Card id="groupCard">
          <h4>Log in</h4>
          <form onSubmit={(e) => handleSubmit(e)}>
            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="email-login"
                label="Email"
                variant="outlined"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="password-login"
                label="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>

            <Button type="submit" variant="outlined">
              Login
            </Button>
          </form>
          {error && (
            <Alert severity="error" id="alertInput">
              {errorMessage}
            </Alert>
          )}
          <div id="registerSection">
            <p>
              Dont have an account?{" "}
              <Link to="/register" id="register">
                Register Here
              </Link>
            </p>
          </div>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Login;
