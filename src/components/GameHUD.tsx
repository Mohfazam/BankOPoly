import { Coins } from 'lucide-react';

export default function GameHUD() {
  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-8 py-4 shadow-xl border-4 border-blue-400 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full p-2 shadow-md">
            <Coins className="w-6 h-6 text-yellow-700" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Zen Points</span>
            <span className="text-2xl font-bold text-yellow-600">1,500</span>
          </div>
        </div>

        <div className="w-px h-10 bg-blue-300 opacity-50"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 uppercase">Level:</span>
          <div className="bg-blue-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-md">1</div>
        </div>
      </div>
    </div>
  );
}
