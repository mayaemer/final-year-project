import Axios from "axios";

export function checkUserType() {
  Axios.get("http://localhost:3001/check").then((response) => {
    if (response.data.loggedIn === true) {
      console.log(response.data.user)
    }

  });
}

