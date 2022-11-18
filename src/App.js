import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import FileUpload from './pages/FileUpload';

import NavBar from './components/NavBar';



function App() {
  return (
    <div className="App">
      <Router>
        <NavBar/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Content' element={<FileUpload />} />

        </Routes>
      </Router>
      

    </div>
  );
}

export default App;
