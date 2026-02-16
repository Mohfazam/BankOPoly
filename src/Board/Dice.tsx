import { useState } from 'react';

interface DiceProps {
  onRoll: (value: number) => void;
  diceValue: number;
}

export default function Dice({ onRoll, diceValue }: DiceProps) {
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    let spins = 0;
    const spinInterval = setInterval(() => {
      spins++;
      if (spins > 12) {
        clearInterval(spinInterval);
        const value = Math.floor(Math.random() * 6) + 1;
        onRoll(value);
        setRolling(false);
      }
    }, 50);
  };

  const getDiceDisplay = () => {
    if (rolling) return '?';
    if (diceValue === 0) return '6';
    return diceValue;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className={`w-32 h-32 bg-linear-to-br from-white to-gray-100 border-4 border-gray-800 rounded-xl flex items-center justify-center shadow-2xl transform transition-all ${rolling ? 'animate-spin' : 'scale-100'}`}>
          <span className="text-6xl font-bold text-gray-800">{getDiceDisplay()}</span>
        </div>
        {rolling && (
          <div className="absolute inset-0 rounded-xl border-4 border-yellow-400 animate-pulse"></div>
        )}
      </div>
      <button
        onClick={handleRoll}
        disabled={rolling}
        className="px-8 py-4 bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg transform hover:scale-105 disabled:scale-100"
      >
        {rolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}
