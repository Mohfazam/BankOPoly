interface StartTileProps {
  closeModal: () => void;
}

export default function StartTile({  }: StartTileProps) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🏁</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Start!</h2>
      <p className="text-gray-600 mb-4">This is where your financial journey begins. Every step teaches you about money management.</p>
      <p className="text-lg font-semibold text-blue-600">Roll the dice to start playing!</p>
    </div>
  );
}