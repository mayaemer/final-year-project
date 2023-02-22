import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { PersonFill } from "react-bootstrap-icons";
import NavDropdown from "react-bootstrap/NavDropdown";
import Axios from "axios";
import Refresh from "./Refresh";


function NavBar() {

  function handleLogout() {
    Axios.get("http://localhost:3001/logout", {
      headers: {
        "x-access-token": localStorage.removeItem("token"),
      },
    }).then((response) => {
      Refresh();
    })
    ;
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/Groups">Groups</Nav.Link>
            <Nav.Link href="/Discover">Discover</Nav.Link>
            <NavDropdown
              id="nav-dropdown-dark-example"
              title={<PersonFill />}
              menuVariant="dark"
            >
              <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;
