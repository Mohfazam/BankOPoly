interface SaveTileProps {
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

export default function SaveTile({
  coins,
  savings,
  setCoins,
  setSavings,
  closeModal,
}: SaveTileProps) {
  const handleDeposit = () => {
    if (coins >= 50) {
      setCoins(coins - 50);
      setSavings(savings + 50);
      closeModal();
    }
  };

  const canDeposit = coins >= 50;

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🏦</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Bank - Deposit Money</h2>
      <p className="text-gray-600 mb-4">Save 50 coins for your future. Banks keep your money safe!</p>
      <div className="bg-blue-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">Current coins: <span className="font-bold">{coins}</span></p>
      </div>
      <button
        onClick={handleDeposit}
        disabled={!canDeposit}
        className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${
          canDeposit
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canDeposit ? 'Deposit 50 coins' : 'Not enough coins'}
      </button>
    </div>
  );
}
