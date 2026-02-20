import React from 'react';
import { motion } from 'framer-motion';

interface TopHUDProps {
  coins: number;
  savings: number;
  wealth: number;
}

export const TopHUD: React.FC<TopHUDProps> = ({ coins, savings, wealth }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
      {/* Game Coins */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-yellow-900/90 to-amber-900/90 border-2 border-yellow-400 rounded-lg p-3 backdrop-blur-sm"
      >
        <div className="text-yellow-400 text-sm">GAME COINS</div>
        <div className="text-2xl font-bold text-white">₹{coins}</div>
      </motion.div>

      {/* Savings */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 border-2 border-green-400 rounded-lg p-3 backdrop-blur-sm"
      >
        <div className="text-green-400 text-sm">SAVINGS</div>
        <div className="text-2xl font-bold text-white">₹{savings}</div>
      </motion.div>

      {/* Town Wealth */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-2 border-purple-400 rounded-lg p-3 backdrop-blur-sm"
      >
        <div className="text-purple-400 text-sm">TOWN WEALTH</div>
        <div className="text-2xl font-bold text-white">₹{wealth}</div>
      </motion.div>
    </div>
  );
};