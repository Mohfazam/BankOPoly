export default function GameHUD() {
  return (
    <>
      {/* Top info bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, rgba(135, 206, 235, 0.95) 0%, rgba(135, 206, 235, 0.7) 100%)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.9)',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            color: '#654321',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span>
            <span style={{ fontSize: '16px' }}>1000</span>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            color: '#2F4F4F',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontSize: '18px' }}>🏘️</span>
            <span style={{ fontSize: '16px' }}>0</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 20px',
          borderRadius: '25px',
          fontWeight: 'bold',
          fontSize: '18px',
          color: '#4169E1',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}>
          🏦 Town Builder
        </div>
      </div>

      {/* Instructions tooltip */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 100,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: '15px' }}>
          🎮 Controls
        </div>
        <div style={{ opacity: 0.9, lineHeight: '1.6' }}>
          🖱️ Drag to rotate • 🔍 Scroll to zoom • 🏦 Click bank to play
        </div>
      </div>
    </>
  );
}