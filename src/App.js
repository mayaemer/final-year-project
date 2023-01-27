import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/register";
import FileUpload from './pages/FileUpload';
import ViewFile from './pages/ViewFile';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    // routes user to various pages when link is clicked
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/Content' element={<FileUpload />} />
          <Route path="/file/:selectedFile" element={<ViewFile />} />
        </Routes>
      </Router>
      

    </div>
  );
}

export default App;

