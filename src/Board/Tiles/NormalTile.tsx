interface NormalTileProps {
  closeModal: () => void;
}

export default function NormalTile({  }: NormalTileProps) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">➡️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Empty Tile</h2>
      <p className="text-gray-600 mb-4">Nothing happens here. Keep moving forward on your financial journey!</p>
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-sm text-gray-700">Keep playing and make smart money choices!</p>
      </div>
    </div>
  );
}