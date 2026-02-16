'use client';

import { useState } from 'react';
import Dice from './Dice';
import StartTile from './Tiles/StartTile';
import SaveTile from './Tiles/SaveTile';
import InterestTile from './Tiles/InterestTile';
import ScamTile from './Tiles/ScamTile';
import BudgetTile from './Tiles/BudgetTile';
import PropertyTile from './Tiles/PropertyTile';
import LoanTile from './Tiles/LoanTile';
import NormalTile from './Tiles/NormalTile';

type TileType = 'start' | 'save' | 'interest' | 'scam' | 'budget' | 'property' | 'loan' | 'normal';

interface TileData {
  id: number;
  type: TileType;
}

// 24 tiles total - 6 tiles per side in clockwise order
const tiles: TileData[] = [
  // Top row (left to right): 0-5
  { id: 0, type: 'start' },
  { id: 1, type: 'save' },
  { id: 2, type: 'normal' },
  { id: 3, type: 'interest' },
  { id: 4, type: 'scam' },
  { id: 5, type: 'normal' },
  
  // Right column (top to bottom): 6-11
  { id: 6, type: 'budget' },
  { id: 7, type: 'property' },
  { id: 8, type: 'loan' },
  { id: 9, type: 'normal' },
  { id: 10, type: 'interest' },
  { id: 11, type: 'save' },
  
  // Bottom row (right to left): 12-17
  { id: 12, type: 'scam' },
  { id: 13, type: 'budget' },
  { id: 14, type: 'normal' },
  { id: 15, type: 'property' },
  { id: 16, type: 'loan' },
  { id: 17, type: 'normal' },
  
  // Left column (bottom to top): 18-23
  { id: 18, type: 'interest' },
  { id: 19, type: 'save' },
  { id: 20, type: 'scam' },
  { id: 21, type: 'budget' },
  { id: 22, type: 'property' },
  { id: 23, type: 'normal' },
];

export default function BoardGame() {
  const [coins, setCoins] = useState(200);
  const [savings, setSavings] = useState(0);
  const [loanActive, setLoanActive] = useState(false);
  const [loanRemaining, setLoanRemaining] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [activeTile, setActiveTile] = useState<TileData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRoll = (value: number) => {
    setDiceValue(value);
    const newPosition = (playerPosition + value) % 24;

    if (newPosition < playerPosition) {
      if (loanActive) {
        setCoins(Math.max(0, coins - 40));
        const remaining = Math.max(0, loanRemaining - 40);
        setLoanRemaining(remaining);
        if (remaining <= 0) {
          setLoanActive(false);
        }
      }
    }

    setPlayerPosition(newPosition);
    setActiveTile(tiles[newPosition]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveTile(null);
  };

  const getTileComponent = () => {
    if (!activeTile) return null;

    const commonProps = {
      coins,
      savings,
      loanActive,
      loanRemaining,
      setCoins,
      setSavings,
      setLoanActive,
      setLoanRemaining,
      closeModal,
    };

    switch (activeTile.type) {
      case 'start':
        return <StartTile {...commonProps} />;
      case 'save':
        return <SaveTile {...commonProps} />;
      case 'interest':
        return <InterestTile {...commonProps} />;
      case 'scam':
        return <ScamTile {...commonProps} />;
      case 'budget':
        return <BudgetTile {...commonProps} />;
      case 'property':
        return <PropertyTile {...commonProps} />;
      case 'loan':
        return <LoanTile {...commonProps} />;
      case 'normal':
        return <NormalTile {...commonProps} />;
      default:
        return null;
    }
  };

  // 4x4 grid layout - 6 tiles per side with hollow 2x2 center
  const topRow = [0, 1, 2, 3, 4, 5];       // Top (left to right)
  const rightColumn = [6, 7, 8, 9, 10, 11]; // Right (top to bottom)
  const bottomRow = [12, 13, 14, 15, 16, 17]; // Bottom (right to left)
  const leftColumn = [18, 19, 20, 21, 22, 23]; // Left (bottom to top)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-40 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-3 drop-shadow-lg">
            💰 Financial Journey 💰
          </h1>
          <p className="text-white text-lg font-semibold drop-shadow">Master money management through play!</p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center items-center mb-8 gap-4 flex-wrap px-4">
          {/* Coins */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl px-6 py-3 shadow-2xl border-4 border-yellow-200 transform hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💰</div>
              <div>
                <p className="text-xs font-bold text-yellow-900 uppercase tracking-wider">Coins</p>
                <p className="text-3xl font-black text-white drop-shadow">{coins}</p>
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl px-6 py-3 shadow-2xl border-4 border-green-200 transform hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏦</div>
              <div>
                <p className="text-xs font-bold text-green-900 uppercase tracking-wider">Savings</p>
                <p className="text-3xl font-black text-white drop-shadow">{savings}</p>
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl px-6 py-3 shadow-2xl border-4 border-blue-200 transform hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📍</div>
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Position</p>
                <p className="text-3xl font-black text-white drop-shadow">{playerPosition + 1}/24</p>
              </div>
            </div>
          </div>

          {/* Loan (if active) */}
          {loanActive && (
            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl px-6 py-3 shadow-2xl border-4 border-red-200 transform hover:scale-105 transition-all animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-4xl">⚠️</div>
                <div>
                  <p className="text-xs font-bold text-red-900 uppercase tracking-wider">Debt</p>
                  <p className="text-3xl font-black text-white drop-shadow">{loanRemaining}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* THE BOARD - 6x6 Grid with Hollow 4x4 Center for Dice */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Board Container */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl shadow-2xl border-8 border-amber-800 p-6">
              {/* 6x6 Grid - outer ring only (hollow center) */}
              <div className="grid grid-cols-6 gap-2">
                {/* TOP ROW - all 6 tiles */}
                {topRow.map((tileId) => (
                  <BoardTile key={tileId} tile={tiles[tileId]} isActive={playerPosition === tileId} />
                ))}

                {/* ROWS 2-5 - only first and last columns have tiles */}
                {[0, 1, 2, 3].map((rowIndex) => (
                  <>
                    <BoardTile 
                      key={`left-${rowIndex}`} 
                      tile={tiles[leftColumn[5 - rowIndex - 1]]} 
                      isActive={playerPosition === leftColumn[5 - rowIndex - 1]} 
                    />
                    <div key={`empty-${rowIndex}-1`} className="w-20 h-20"></div>
                    <div key={`empty-${rowIndex}-2`} className="w-20 h-20"></div>
                    <div key={`empty-${rowIndex}-3`} className="w-20 h-20"></div>
                    <div key={`empty-${rowIndex}-4`} className="w-20 h-20"></div>
                    <BoardTile 
                      key={`right-${rowIndex}`} 
                      tile={tiles[rightColumn[rowIndex]]} 
                      isActive={playerPosition === rightColumn[rowIndex]} 
                    />
                  </>
                ))}

                {/* BOTTOM ROW - all 6 tiles (reversed) */}
                {[...bottomRow].reverse().map((tileId) => (
                  <BoardTile key={tileId} tile={tiles[tileId]} isActive={playerPosition === tileId} />
                ))}
              </div>

              {/* CENTER DICE - Absolutely positioned in the hollow center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                <div className="bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 rounded-3xl p-6 shadow-2xl border-8 border-yellow-600">
                  <Dice onRoll={handleRoll} diceValue={diceValue} />
                </div>
              </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute -top-6 -left-6 text-6xl animate-bounce">🎲</div>
            <div className="absolute -top-6 -right-6 text-6xl animate-bounce">💎</div>
            <div className="absolute -bottom-6 -left-6 text-6xl animate-bounce">🏆</div>
            <div className="absolute -bottom-6 -right-6 text-6xl animate-bounce">⭐</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-8">
          <p className="text-white text-lg font-bold drop-shadow-lg">
            🎯 Roll the dice • 🎲 Move forward • 💡 Learn & Earn!
          </p>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl p-8 max-w-md w-full shadow-2xl border-8 border-gray-800 max-h-[85vh] overflow-y-auto transform animate-scaleIn">
              <div className="mb-6">
                {getTileComponent()}
              </div>
              <button
                onClick={closeModal}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-black text-xl rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg transform hover:scale-105 active:scale-95 border-4 border-white"
              >
                Continue Journey →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BoardTile({ tile, isActive }: { tile: TileData; isActive: boolean }) {
  const tileConfig: { 
    [key in TileType]: { 
      gradient: string; 
      border: string; 
      icon: string; 
      shadow: string;
    } 
  } = {
    start: { gradient: 'from-yellow-400 via-yellow-300 to-yellow-500', border: 'border-yellow-700', icon: '🏁', shadow: 'shadow-yellow-500/50' },
    save: { gradient: 'from-blue-400 via-blue-300 to-blue-500', border: 'border-blue-700', icon: '🏦', shadow: 'shadow-blue-500/50' },
    interest: { gradient: 'from-green-400 via-green-300 to-green-500', border: 'border-green-700', icon: '💰', shadow: 'shadow-green-500/50' },
    scam: { gradient: 'from-red-400 via-red-300 to-red-500', border: 'border-red-700', icon: '⚠️', shadow: 'shadow-red-500/50' },
    budget: { gradient: 'from-purple-400 via-purple-300 to-purple-500', border: 'border-purple-700', icon: '📚', shadow: 'shadow-purple-500/50' },
    property: { gradient: 'from-orange-400 via-orange-300 to-orange-500', border: 'border-orange-700', icon: '🏠', shadow: 'shadow-orange-500/50' },
    loan: { gradient: 'from-pink-400 via-pink-300 to-pink-500', border: 'border-pink-700', icon: '📋', shadow: 'shadow-pink-500/50' },
    normal: { gradient: 'from-gray-400 via-gray-300 to-gray-500', border: 'border-gray-700', icon: '➡️', shadow: 'shadow-gray-500/50' },
  };

  const config = tileConfig[tile.type];

  return (
    <div 
      className={`relative bg-gradient-to-br ${config.gradient} border-4 ${config.border} rounded-xl w-20 h-20 flex flex-col items-center justify-center cursor-pointer transition-all transform hover:scale-110 hover:rotate-3 ${config.shadow} shadow-xl ${
        isActive ? 'ring-8 ring-white ring-opacity-80 scale-105 animate-wiggle' : ''
      }`}
    >
      {/* Tile Icon */}
      <div className="text-3xl mb-0.5 drop-shadow-lg">{config.icon}</div>
      
      {/* Tile Number Badge */}
      <div className="absolute top-0.5 right-0.5 bg-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-800 shadow-lg">
        <span className="text-[9px] font-black text-gray-800">{tile.id + 1}</span>
      </div>

      {/* Active Player Token - Ludo Style! */}
      {isActive && (
        <div className="absolute -bottom-3 -right-3 z-50">
          <div className="relative">
            {/* Token shadow */}
            <div className="absolute inset-0 bg-black opacity-30 rounded-full blur-md transform translate-y-1"></div>
            {/* Token body */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
              <div className="w-8 h-8 bg-gradient-to-br from-red-300 to-red-500 rounded-full border-2 border-red-700 flex items-center justify-center">
                <div className="text-xl">👤</div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-400 rounded-full opacity-40 blur-xl animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}