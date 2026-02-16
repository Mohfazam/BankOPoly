import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TownMap from './Home/TownMap';
import BoardGame from './Board/BoardGame';

function App() {
  console.log("Reached app.tsx")
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<TownMap />} />
        
        <Route path="/board" element={<BoardGame />} />
      </Routes>
    </Router>
  );
}

export default App;