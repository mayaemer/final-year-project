import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from './pages/Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectedGroup from './pages/SelectedGroup';
import Discover from './pages/Discover';
import Questions from './pages/Questions';
import Quiz from './pages/Quiz';
import SelectedQuiz from './pages/SelectedQuiz';
import Content from './pages/Content';



function App() {
  return (
    // routes user to various pages when link is clicked
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/group/:selectedGroup' element={<SelectedGroup />} />
          <Route path='/Home' element={<Home />} />
          <Route path='/Content/:groupId' element={<Content />} />
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

