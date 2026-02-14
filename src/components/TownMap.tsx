import GameHUD from './GameHUD';
import BankBuilding from './BankBuilding';
import EmptyPlotGrid from './EmptyPlotGrid';

export default function TownMap() {
  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 relative animate-slide-in">
      <GameHUD />

      <div className="absolute inset-0 top-20">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-20 animate-shimmer" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34,197,94,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>

          <div className="relative z-10 flex flex-col items-center justify-center gap-8">
            <div className="text-center animate-slide-in" style={{animationDelay: '0.2s'}}>
              <div className="bg-white bg-opacity-95 rounded-3xl px-8 py-5 shadow-lg border-4 border-yellow-300 max-w-2xl">
                <p className="text-2xl font-bold text-emerald-700">Build your dream town</p>
                <p className="text-lg text-emerald-600 mt-1">by learning banking concepts!</p>
              </div>
            </div>

            <div className="relative z-20 flex flex-col items-center gap-8">
              <BankBuilding />
              <EmptyPlotGrid />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
