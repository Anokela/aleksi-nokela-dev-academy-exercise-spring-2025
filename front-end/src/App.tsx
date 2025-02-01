import './App.css';
import Home from './Pages/Home';
import SingleDayDetail from './Pages/SingleDayDetail';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ElectricityDataProvider } from './context/ElectricityDataContext';

function App() {
  return (
    <>
      <ElectricityDataProvider>
        <Router>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/detail/:date" Component={SingleDayDetail} />
          </Routes>
        </Router>
      </ElectricityDataProvider>
    </>
  )
}

export default App
