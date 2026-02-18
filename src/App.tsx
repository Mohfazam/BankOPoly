import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TownMap from './Home/TownMap';
import BoardGame from './Board/BoardGame';
import WelcomePage from './Home/WelcomePage';
function App() {
  console.log("Reached app.tsx")
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/town" element={<TownMap />} />
        <Route path="/board" element={<BoardGame />} />
      </Routes>
    </Router>
  );
}

export default App;