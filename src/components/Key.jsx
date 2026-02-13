import React from 'react'
import '../index.css'

const Key = ({
  note,
  type,
  isPressed,
  isPlayableLeft,
  isPlayableRight,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  showNoteNames = true,
}) => {
  const isPlayable = isPlayableLeft || isPlayableRight;
  const playableClass = isPlayableLeft && isPlayableRight
    ? 'playable-both'
    : isPlayableLeft
      ? 'playable-left'
      : isPlayableRight
        ? 'playable-right'
        : '';
  const showLabel = showNoteNames && type === "white";

  return (
    <button
        className={`key ${type} ${isPlayable ? 'playable' : ''} ${playableClass} ${isPressed ? 'pressed' : ''}`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
    >
        <span className="key-text">{showLabel ? note : null}</span>
    </button>
  )
}

export default Key
