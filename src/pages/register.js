import { useState } from "react";
import Card from "@mui/material/Card";
import { Button, Grid, TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Axios from "axios";
import { Link } from "react-router-dom";
import { registrationSchema } from "../Validations/Validation";
import "../styles/register.css";

// this page is empty at this point
function Register() {
  const usertype = [
    {
      value: "Teacher",
      label: "Teacher",
    },
    {
      value: "Student",
      label: "Student",
    },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [userType, setUserType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorVisbility, setErrorVisibility] = useState(false);
  const [successVisbility, setSuccessVisibility] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const registrationData = {
      Email: email,
      Fname: firstName,
      Sname: surName,
      Pass: password,
      Confirm: confirmPassword,
      UserType: userType,
    };

    const validate = await registrationSchema.isValid(registrationData);

    if (validate === true) {
      setErrorMessage("");
      try {
        Axios.post("http://localhost:3001/register", registrationData).then(
          function (res) {
            if (res.data.message == "Success") {
              setSuccessVisibility(true);
              setErrorVisibility(false);

              setEmail("");
              setFirstName("");
              setSurName("");
              setPassword("");
              setConfirmPassword("");
              setUserType("");
            } else {
              setErrorVisibility(true);
              setErrorMessage(res.data.message);
            }
          }
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      setErrorVisibility(true);
      setErrorMessage("Data not valid");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item lg={12} md={12} xs={12}>
        <Card variant="outlined" id="groupCard">
          <h4>Create an account</h4>
          <form onSubmit={(e) => handleSubmit(e)}>
            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-basic"
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>

            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-basic"
                label="Surname"
                variant="outlined"
                value={surName}
                onChange={(e) => setSurName(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>

            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-password-input"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>

            <Grid item lg={12} md={12} xs={12} id="input">
              <TextField
                id="outlined-select-usertype"
                select
                label="Select"
                defaultValue=""
                value={userType}
                helperText="Please select your user type"
                onChange={(e) => setUserType(e.target.value)}
              >
                {usertype.map((user) => (
                  <MenuItem key={user.value} value={user.value}>
                    {user.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Button type="submit" variant="outlined" id="input">
              Register
            </Button>
            <Grid>
              <p>
                Already have an account? <Link to="/">Login here</Link>
              </p>
            </Grid>
            {successVisbility && (
              <Alert severity="success" id="alert">
                Registration successful.
                <Link to="/">Go to login page</Link>
              </Alert>
            )}
            {errorVisbility && (
              <Alert severity="error" id="alert">
                {errorMessage}
              </Alert>
            )}
          </form>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Register;
