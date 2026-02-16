interface LoanTileProps {
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

export default function LoanTile({
  coins,
  loanActive,
  setCoins,
  setLoanActive,
  setLoanRemaining,
  closeModal,
}: LoanTileProps) {
  const handleTakeLoan = () => {
    if (!loanActive) {
      setCoins(coins + 100);
      setLoanActive(true);
      setLoanRemaining(120);
    }
    closeModal();
  };

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">📋</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Bank Loan</h2>
      <p className="text-gray-600 mb-4">You can borrow 100 coins but must repay 120.</p>
      <div className="bg-pink-100 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">Borrow: <span className="font-bold text-blue-600">+100 coins</span></p>
        <p className="text-sm text-gray-700">Repay: <span className="font-bold text-red-600">120 coins</span></p>
        {loanActive && (
          <p className="text-xs text-red-600 mt-2">You already have an active loan!</p>
        )}
      </div>
      <button
        onClick={handleTakeLoan}
        disabled={loanActive}
        className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${
          !loanActive
            ? 'bg-pink-500 text-white hover:bg-pink-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loanActive ? 'Loan Already Active' : 'Take Loan (+100)'}
      </button>
    </div>
  );
}
