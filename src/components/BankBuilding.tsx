import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Building2 } from 'lucide-react';

export default function BankBuilding() {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      navigate('/board');
    }, 600);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer transition-all duration-300 ${isClicked ? 'animate-bounce-scale' : 'animate-float hover:animate-pulse-glow'}`}
    >
      <div className={`w-40 h-48 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl shadow-2xl border-4 border-yellow-400 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${isClicked ? 'scale-110' : 'hover:scale-105'}`}>
        <div className="absolute inset-0 bg-white bg-opacity-10"></div>

        <div className="absolute top-4 left-4 right-4 h-12 bg-yellow-300 rounded-xl border-2 border-yellow-600 flex items-center justify-center">
          <span className="font-bold text-yellow-700 text-sm">BANK</span>
        </div>

        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Building2 className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
            <span className="text-white font-bold text-sm drop-shadow-lg">Tap to Play!</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 h-6 bg-yellow-200 rounded border-2 border-yellow-600 flex gap-1 px-2">
          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1"></div>
          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1"></div>
          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1"></div>
        </div>
      </div>

      <div className={`absolute inset-0 w-40 h-48 bg-blue-400 rounded-2xl blur-lg opacity-0 transition-opacity duration-300 ${!isClicked && 'group-hover:opacity-30'} pointer-events-none`}></div>
    </div>
  );
}
