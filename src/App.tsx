import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TownMap from './Home/TownMap';
import BoardGame from './Board/BoardGame';
import WelcomePage from './Home/WelcomePage';
import GameBook from './Home/GameBook/GameBook';
function App() {
  console.log("Reached app.tsx")
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/town" element={<TownMap />} />
        <Route path="/board" element={<BoardGame />} />
        <Route path="/gamebook" element={<GameBook />} />
      </Routes>
    </Router>
  );
}

export default App;