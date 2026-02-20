import React from 'react';
import { motion } from 'framer-motion'; // Fixed typo

interface DiceProps {
  onRoll: (value: number) => void;
  disabled: boolean;
  value: number;
  isRolling: boolean;
}

export const Dice: React.FC<DiceProps> = ({ onRoll, disabled, value, isRolling }) => {
  const rollDice = () => {
    if (disabled || isRolling) return;
    const result = Math.floor(Math.random() * 6) + 1;
    onRoll(result);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={rollDice}
    >
      <motion.div
        animate={isRolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 180, 360, 540],
          rotateZ: [0, 90, 180, 270],
        } : {}}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-yellow-400 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <span className="text-4xl font-bold text-white drop-shadow-lg">
          {value}
        </span>
      </motion.div>
      
      {/* Dice dots decoration */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full bg-white/30 ${
              i === 4 ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};