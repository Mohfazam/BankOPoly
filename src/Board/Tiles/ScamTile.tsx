interface ScamTileProps {
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

export default function ScamTile({
  coins,
  savings,
  loanActive,
  loanRemaining,
  setCoins,
  setSavings,
  setLoanActive,
  setLoanRemaining,
  closeModal,
}: ScamTileProps) {
  const handleShareOTP = () => {
    setCoins(Math.max(0, coins - 100));
    closeModal();
  };

  const handleIgnore = () => {
    setCoins(coins + 50);
    closeModal();
  };

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Scam Alert!</h2>
      <p className="text-gray-700 mb-4 font-semibold">Someone sent you a message asking for your OTP (One Time Password)!</p>
      <div className="bg-red-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 mb-2">Choose wisely:</p>
        <ul className="text-xs text-gray-600 text-left">
          <li>• Share OTP: Lose 100 coins (RISKY!)</li>
          <li>• Ignore: Gain 50 coins (SAFE!)</li>
        </ul>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleShareOTP}
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
        >
          Share OTP (-100)
        </button>
        <button
          onClick={handleIgnore}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
        >
          Ignore (+50)
        </button>
      </div>
    </div>
  );
}
