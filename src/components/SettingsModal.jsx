import React from 'react';

const SettingsModal = ({ isOpen, onClose, currentLayout, onToggleLayout }) => {
  return (
    <>
      {isOpen && (
        <div className="settings-overlay" onClick={onClose}></div>
      )}

      {/* The Dropdown Panel */}
      <div className={`settings-menu ${isOpen ? 'open' : ''}`}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>SETTINGS</h2>
            <button 
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
                ×
            </button>
        </div>

        {/* SETTING 1: Layout */}
        <div className="setting-item">
            <span className="setting-label">KEYBOARD LAYOUT</span>
            <button 
                onClick={onToggleLayout}
                style={{
                    background: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    minWidth: '80px'
                }}
            >
                {currentLayout}
            </button>
        </div>

        {/* Placeholder for future settings */}
        {/* <div className="setting-item"> ... </div> */}

      </div>
    </>
  );
};

export default SettingsModal;