import React from 'react';

const AppHeader = ({
  isDualLike,
  leftShift,
  rightShift,
  leftBounds,
  rightBounds,
  singleShiftBounds,
  onChangeShift,
  currentMode,
  onShiftMode,
  isScaleMode,
  currentScaleLabel,
  onShiftScale,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '800px',
        marginBottom: '1rem',
        alignItems: 'center',
        zIndex: 10,
      }}
    >

      

      {isDualLike ? (
        <div
          className="octave-controls"
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>L</span>
            <button onClick={() => onChangeShift('left', -1)} disabled={leftShift <= leftBounds.min}>-</button>
            <span>SHIFT: {leftShift}</span>
            <button onClick={() => onChangeShift('left', 1)} disabled={leftShift >= leftBounds.max}>+</button>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>R</span>
            <button onClick={() => onChangeShift('right', -1)} disabled={rightShift <= rightBounds.min}>-</button>
            <span>SHIFT: {rightShift}</span>
            <button onClick={() => onChangeShift('right', 1)} disabled={rightShift >= rightBounds.max}>+</button>
          </div>
        </div>
      ) : (
        <div
          className="octave-controls"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <button onClick={() => onChangeShift('left', -1)} disabled={leftShift <= singleShiftBounds.min}>-</button>
          <span>KEY SHIFT (white): {leftShift}</span>
          <button onClick={() => onChangeShift('left', 1)} disabled={leftShift >= singleShiftBounds.max}>+</button>
        </div>
      )}

      <div className="control-group">
        <button onClick={() => onShiftMode(-1)}>
          &lt;
        </button>
        <span
          style={{
            margin: '0 0.5rem',
            minWidth: '80px',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {currentMode}
        </span>
        <button onClick={() => onShiftMode(1)}>
          &gt;
        </button>
      </div>

      {isScaleMode && (
        <div className="control-group" style={{ marginLeft: '0.75rem' }}>
          <button onClick={() => onShiftScale(-1)}>
            &lt;
          </button>
          <span
            style={{
              margin: '0 0.5rem',
              minWidth: '110px',
              display: 'inline-block',
              textAlign: 'center',
            }}
          >
            {currentScaleLabel}
          </span>
          <button onClick={() => onShiftScale(1)}>
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default AppHeader;
