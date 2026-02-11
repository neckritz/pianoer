export const getOctaveNote = (noteString, shift) => {
    // 1. Split "C4" into "C" and "4"
    // Regex: Match the letter(s) and then the number
    const match = noteString.match(/([A-G]#?)(\d)/);
    
    if (!match) return noteString; // Safety fallback
    
    const [_, note, octave] = match; // e.g. "C", "4"

    const newOctave = parseInt(octave) + shift;
    
    return `${note}${newOctave}`;
};

export const getNoteIndex = (noteString, notes) => {
    return notes.findIndex((n) => n.note === noteString);
};

export const noteToPitchClass = (noteString) => {
    const match = noteString.match(/^([A-G])(#?)/);
    if (!match) return null;
    const base = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11,
    }[match[1]];

    const sharp = match[2] === '#' ? 1 : 0;
    return (base + sharp) % 12;
};
