import React from 'react';

const LoadingScreen = ({ progress, loadedCount, totalCount, errors }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Loading Title */}
      <h2 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        textAlign: 'center',
        fontWeight: '300',
        letterSpacing: '0.1em'
      }}>
        Loading Presentation
      </h2>

      {/* Progress Bar Container */}
      <div style={{
        width: 'min(80vw, 400px)',
        height: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '0.25rem',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        {/* Progress Bar Fill */}
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4ade80',
          borderRadius: '0.25rem',
          transition: 'width 0.3s ease-out'
        }} />
      </div>

      {/* Progress Text */}
      <div style={{
        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
        marginBottom: '1rem',
        textAlign: 'center',
        opacity: 0.8
      }}>
        {loadedCount} of {totalCount} images loaded ({progress}%)
      </div>

      {/* Loading Animation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div style={{
          maxWidth: 'min(80vw, 500px)',
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
          color: '#fca5a5'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
            Some images failed to load:
          </div>
          {errors.slice(0, 3).map((error, index) => (
            <div key={index} style={{ opacity: 0.8, fontSize: '0.8em' }}>
              • {error}
            </div>
          ))}
          {errors.length > 3 && (
            <div style={{ opacity: 0.6, fontSize: '0.8em', marginTop: '0.25rem' }}>
              ... and {errors.length - 3} more
            </div>
          )}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 