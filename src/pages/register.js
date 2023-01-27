import { useState } from "react";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useFormik } from "formik";
import Axios from "axios";

// this page is empty at this point
function Register() {

  const {val, handleBlur, handleChange} = useFormik({
    initialValues: {
      Email:"",
      Fname:"",
      Sname:"",
      Pass:"",
      Confirm:"",
      UserType:""
    },
  });
 
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

  const handleSubmit = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:3001/register", {
      Email: email,
      Fname: firstName,
      Sname: surName,
      Pass: password,
      Confirm: confirmPassword,
      UserType: userType,   

    }).then(function (res) {
      console.log(res);
    });
  };

  return (
    <div>
      <Card variant="outlined">
          <form onSubmit={handleSubmit}>
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
          </form>
      </Card>
    </div>
  );
}

export default Register;
