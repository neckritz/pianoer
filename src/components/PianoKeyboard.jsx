import React from 'react';
import Key from './Key';
import { NOTES } from './notes';

const PianoKeyboard = ({
  pressedNotes,
  playableNotes,
  onMouseDown,
  onMouseUp,
  showNoteNames = true,
}) => {
  return (
    <div className="piano">
      {NOTES.map(({ note, type }) => (
        <Key
          key={note}
          note={note}
          type={type}
          isPressed={pressedNotes.includes(note)}
          isPlayableLeft={playableNotes.left.has(note)}
          isPlayableRight={playableNotes.right.has(note)}
          onMouseDown={() => onMouseDown(note)}
          onMouseUp={() => onMouseUp(note)}
          onMouseLeave={() => onMouseUp(note)}
          showNoteNames={showNoteNames}
        />
      ))}
    </div>
  );
};

export default PianoKeyboard;
