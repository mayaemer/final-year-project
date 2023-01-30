import { useState } from "react";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Axios from "axios";
import { registrationSchema } from "../Validations/Validation";

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

    const validate = await registrationSchema.isValid(registrationData)
    
    if(validate === true){
      setErrorMessage('');
      try{
      Axios.post("http://localhost:3001/register", registrationData).then(function (res) {
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
      <Card variant="outlined">
          <form onSubmit={(e) => handleSubmit(e)}>
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="First Name"
              variant="outlined"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              label="Surname"
              variant="outlined"
              onChange={(e) => setSurName(e.target.value)}
            />
            <TextField
              id="outlined-password-input"
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              id="outlined-password-input"
              label="Confirm Password"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <TextField
              id="outlined-select-usertype"
              select
              label="Select"
              defaultValue=""
              helperText="Please select your user type"
              onChange={(e) => setUserType(e.target.value)}
            >
              {usertype.map((user) => (
                <MenuItem key={user.value} value={user.value}>
                  {user.label}
                </MenuItem>
              ))}
            </TextField>
            <button type="submit">Register</button>
            <p>{errorMessage}</p>
          </form>
      </Card>
    </div>
  );
}

export default Register;
