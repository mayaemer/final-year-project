import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";
import { loginSchema } from "../Validations/Validation";
import Axios from "axios";

// this page is empty at this point
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async(event) => {
    event.preventDefault();
    const loginData = {
      Email: email,
      Pass: password
    };
  
  const validate = await loginSchema.isValid(loginData)

  if(validate === true){
    setErrorMessage('');
    try{
    Axios.post("http://localhost:3001/login", loginData).then(function (res) {
      console.log(res);
    });}
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
