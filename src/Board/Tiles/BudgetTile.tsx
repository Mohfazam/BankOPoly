interface BudgetTileProps {
  coins: number;
  savings: number;
  loanActive: boolean;
  loanRemaining: number;
  setCoins: (value: number) => void;
  setSavings: (value: number) => void;
  setLoanActive: (value: boolean) => void;
  setLoanRemaining: (value: number) => void;
  closeModal: () => void;
}

export default function BudgetTile({
  coins,
  savings,
  loanActive,
  loanRemaining,
  setCoins,
  setSavings,
  setLoanActive,
  setLoanRemaining,
  closeModal,
}: BudgetTileProps) {
  const handleBuyToy = () => {
    if (coins >= 100) {
      setCoins(coins - 100);
    }
    closeModal();
  };

  const handleSaveForSchool = () => {
    setSavings(savings + 50);
    closeModal();
  };

  const canBuyToy = coins >= 100;

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Budget Decision</h2>
      <p className="text-gray-600 mb-4">You have 100 coins. What do you do?</p>
      <div className="bg-purple-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 mb-2">Current coins: <span className="font-bold">{coins}</span></p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleBuyToy}
          disabled={!canBuyToy}
          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all ${
            canBuyToy
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Buy Toy (-100)
        </button>
        <button
          onClick={handleSaveForSchool}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
        >
          Save (+50)
        </button>
      </div>
    </div>
  );
}
