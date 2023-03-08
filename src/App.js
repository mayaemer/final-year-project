import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/register";
import FileUpload from './pages/FileUpload';
import ViewFile from './pages/ViewFile';
import Groups from './pages/Groups'
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectedGroup from './pages/SelectedGroup';
import Discover from './pages/Discover';
import Questions from './pages/Questions';
import Quiz from './pages/Quiz';
import SelectedQuiz from './pages/SelectedQuiz';



function App() {
  return (
    // routes user to various pages when link is clicked
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/group/:selectedGroup' element={<SelectedGroup />}></Route>
          <Route path='/home' element={<Home />} />
          <Route path='/Groups' element={<Groups />} />
          <Route path='/Content' element={<FileUpload />} />
          <Route path="/file/:selectedFile" element={<ViewFile />} />
          <Route path="/Discover" element={<Discover />} />
          <Route path="/Questions/:groupId" element={<Questions />} />
          <Route path="/Quiz/:groupId" element={<Quiz />} />
          <Route path="/Quiz/:groupId/:quizId" element={<SelectedQuiz />} />
        </Routes>
      </Router>
      

    </div>
  );
}

export default App;

