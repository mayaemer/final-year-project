import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";
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
  const [alert, setAlert] = useState("");

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
        navigate("/home");
      }
    }, []);
  });

  // post login data to server to validate it against database records
  // if successful add token to local storage
  const handleSubmit = async(e) => {
    e.preventDefault();
    const loginData = {
      Email: email,
      Pass: password
    };
  
  const validate = await loginSchema.isValid(loginData)

  if(validate === true){
    setErrorMessage('');
    try{
    Axios.post("http://localhost:3001/login", loginData).then(function (res) {
      if (res.data.message) {
        setAlert(res.data.message);

      } else {
        localStorage.setItem("token", res.data.token);
        Refresh();
      }    });}
    catch(e){
      console.error(e);
    }
  }
  else {
    setErrorMessage('Data not valid');
  }
  };

  return (
    <div>
      <div id="card">
        <Card variant="outlined">
          <form onSubmit={(e) => handleSubmit(e)}>
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="outlined-password-input"
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          <p>{errorMessage}</p>
          <p>{alert}</p>
          <div id="registerSection">
            <p>Dont have an account?</p>
            <Link to="/register" id="register">
              Register Here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
