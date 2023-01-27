import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";

// this page is empty at this point
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const submitLogin = (event) => {
    event.preventDefault();
    console.log(email);
    console.log(password);
  };

  return (
    <div>
      <div id="card">
        <Card variant="outlined">
          <TextField id="outlined-basic" label="Email" variant="outlined" onChange={handleEmail}/>
          <TextField id="outlined-password-input" label="Password" type="password" onChange={handlePassword}/>
          <button onClick={submitLogin}>Login</button>
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
