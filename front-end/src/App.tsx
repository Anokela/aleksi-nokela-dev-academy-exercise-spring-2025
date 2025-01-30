import './App.css';
import Home from './Pages/Home';
import SingleDayDetail from './Pages/singleDayDetail';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
            <Routes>
                <Route path="/" Component={Home} />
                <Route path="/detail/:date" Component={SingleDayDetail} />
            </Routes>
        </Router>
    </>
  )
}

export default App
