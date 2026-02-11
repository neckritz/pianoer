import React from 'react';

const SplashScreen = ({ onStart }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ marginBottom: '2rem', color: '#888' }}>
        Experience the brutalist synth.
      </p>
      <button
        className="key white"
        style={{ height: 'auto', width: 'auto', padding: '1rem 2rem' }}
        onClick={onStart}
      >
        ENTER STUDIO
      </button>
    </div>
  );
};

export default SplashScreen;
