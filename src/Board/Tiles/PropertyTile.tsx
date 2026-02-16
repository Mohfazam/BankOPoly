interface PropertyTileProps {
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

export default function PropertyTile({
  coins,
  savings,
  loanActive,
  loanRemaining,
  setCoins,
  setSavings,
  setLoanActive,
  setLoanRemaining,
  closeModal,
}: PropertyTileProps) {
  const handleBuyProperty = () => {
    if (coins >= 150) {
      setCoins(coins - 150);
    }
    closeModal();
  };

  const handleTakeLoan = () => {
    setCoins(coins + 100);
    setLoanActive(true);
    setLoanRemaining(120);
    closeModal();
  };

  const canBuyProperty = coins >= 150;

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🏠</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Opportunity</h2>
      <p className="text-gray-600 mb-4">A property costs 150 coins. You can buy it or take a loan.</p>
      <div className="bg-orange-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 mb-2">Current coins: <span className="font-bold">{coins}</span></p>
        {loanActive && <p className="text-xs text-red-600">You already have an active loan!</p>}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleBuyProperty}
          disabled={!canBuyProperty}
          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all ${
            canBuyProperty
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Buy Now (-150)
        </button>
        <button
          onClick={handleTakeLoan}
          disabled={loanActive}
          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all ${
            !loanActive
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Take Loan (+100)
        </button>
      </div>
    </div>
  );
}
