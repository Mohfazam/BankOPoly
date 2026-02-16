interface InterestTileProps {
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

export default function InterestTile({
  coins,
  savings,
  loanActive,
  loanRemaining,
  setCoins,
  setSavings,
  setLoanActive,
  setLoanRemaining,
  closeModal,
}: InterestTileProps) {
  const handleCollect = () => {
    const bonus = Math.floor(savings * 0.1);
    setSavings(savings + bonus);
    closeModal();
  };

  const interestBonus = Math.floor(savings * 0.1);

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">💰</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Interest Collection</h2>
      <p className="text-gray-600 mb-4">Your savings are growing! Collect 10% interest.</p>
      <div className="bg-green-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">Your savings: <span className="font-bold">{savings}</span></p>
        <p className="text-lg text-green-600 font-bold mt-2">You earn: +{interestBonus} coins!</p>
      </div>
      <button
        onClick={handleCollect}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
      >
        Collect Interest
      </button>
    </div>
  );
}
