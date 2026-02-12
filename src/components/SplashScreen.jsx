import React from 'react';

const SplashScreen = ({ onStart }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        type="button"
        className="roboto-mono-title splash-start"
        onClick={onStart}
        aria-label="Start Pianoer"
      >
        PIANOER
      </button>
    </div>
  );
};

export default SplashScreen;
