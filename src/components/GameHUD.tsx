export default function GameHUD() {
  return (
    <>
      {/* Top bar with resources */}
      <div style={{
        position: 'absolute',
        top: 15,
        left: 15,
        display: 'flex',
        gap: '12px',
        zIndex: 100
      }}>
        {/* Gold counter */}
        <div style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          padding: '8px 18px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          border: '3px solid white'
        }}>
          <span style={{ fontSize: '22px' }}>💰</span>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#654321',
            fontFamily: 'Arial, sans-serif'
          }}>
            0
          </span>
        </div>

        {/* XP/Level counter */}
        <div style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          padding: '8px 18px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          border: '3px solid white'
        }}>
          <span style={{ fontSize: '22px' }}>⭐</span>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            0
          </span>
        </div>
      </div>

      {/* Top center title */}
      <div style={{
        position: 'absolute',
        top: 15,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '12px 30px',
        borderRadius: '30px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        border: '3px solid #4A90E2',
        zIndex: 100,
        maxWidth: '500px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#4A90E2',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Build your dream town by<br/>
          <span style={{ fontSize: '15px', color: '#666' }}>learning building concepts.</span>
        </div>
      </div>

      {/* Bottom instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 24px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#333',
        fontWeight: '500',
        zIndex: 100
      }}>
        🖱️ Click on buildings or empty plots to interact
      </div>
    </>
  );
}