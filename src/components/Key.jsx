import React from 'react'
import '../index.css'

const Key = ({ note, type, isPressed, isPlayableLeft, isPlayableRight, onMouseDown, onMouseUp, onMouseLeave }) => {
  const isPlayable = isPlayableLeft || isPlayableRight;
  const playableClass = isPlayableLeft && isPlayableRight
    ? 'playable-both'
    : isPlayableLeft
      ? 'playable-left'
      : isPlayableRight
        ? 'playable-right'
        : '';

  return (
    <button
        className={`key ${type} ${isPlayable ? 'playable' : ''} ${playableClass} ${isPressed ? 'pressed' : ''}`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
    >
        <span className="key-text">{type==="black"?null:note}</span>
    </button>
  )
}

export default Key
