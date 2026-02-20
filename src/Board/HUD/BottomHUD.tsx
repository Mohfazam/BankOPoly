import React from 'react';
import { motion } from 'framer-motion'; // Add this import
import { Dice } from '../Dice';

interface BottomHUDProps {
  onDiceRoll: (value: number) => void;
  disabled: boolean;
  diceValue: number;
  isRolling: boolean;
  onExit?: () => void;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ 
  onDiceRoll, 
  disabled, 
  diceValue, 
  isRolling,
  onExit 
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end z-10">
      {/* Exit button */}
      {onExit && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-gray-600 rounded-lg px-4 py-2 text-white font-bold backdrop-blur-sm"
        >
          ← Back to Town
        </motion.button>
      )}

      {/* Dice */}
      <div className="flex-1 flex justify-center">
        <Dice 
          onRoll={onDiceRoll}
          disabled={disabled}
          value={diceValue}
          isRolling={isRolling}
        />
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-blue-900/90 to-indigo-900/90 border-2 border-blue-400 rounded-lg p-3 backdrop-blur-sm"
      >
        <div className="text-blue-400 text-sm">CURRENT TILE</div>
        <div className="text-white font-bold">Roll to move</div>
      </motion.div>
    </div>
  );
};