import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TownMap from './Home/TownMap';

function App() {
  console.log("Reached app.tsx")
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<TownMap />} />
        
        <Route path="/board" element={<div className="flex items-center justify-center min-h-screen bg-linear-to-b from-blue-300 to-blue-100"><p className="text-2xl font-bold text-blue-800">Game Board Coming Soon!</p></div>} />
      </Routes>
    </Router>
  );
}

export default App;