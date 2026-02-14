export default function EmptyPlotGrid() {
    const gridSize = 3;
  
    return (
      <div className="grid gap-6" style={{gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`}}>
        {Array.from({length: gridSize * gridSize}).map((_, i) => (
          <div
            key={i}
            className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl border-4 border-green-700 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-yellow-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
  
            <div className="absolute inset-1 border-2 border-dashed border-green-600 rounded-lg opacity-50"></div>
  
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 opacity-40">+</div>
                <p className="text-xs font-bold text-green-700 opacity-60 mt-1">Build</p>
              </div>
            </div>
  
            <div className="absolute inset-0 shadow-inset border-4 border-green-900 rounded-xl opacity-30 pointer-events-none"></div>
          </div>
        ))}
      </div>
    );
  }
  