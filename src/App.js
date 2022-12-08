import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FileUpload from './pages/FileUpload';
import ViewFile from './pages/ViewFile';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    // routes user to various pages when link is clicked
    <div className="App">
      <Router>
        <NavBar/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Content' element={<FileUpload />} />
          <Route path="/file/:selectedFile" element={<ViewFile />} />
        </Routes>
      </Router>
      

    </div>
  );
}

export default App;

