// src/components/notes.js
const generateNotes = () => {
    // Full 88-key layout from A0 through C8.
    const octaveTemplate = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const getType = (note) => note.includes("#") ? "black" : "white";

    const notes = [
        { note: "A0", type: "white" },
        { note: "A#0", type: "black" },
        { note: "B0", type: "white" },
    ];

    for (let octave = 1; octave <= 7; octave += 1) {
        octaveTemplate.forEach((noteName) => {
            notes.push({ note: `${noteName}${octave}`, type: getType(noteName) });
        });
    }

    notes.push({ note: "C8", type: "white" });

    return notes;
};

export const SCALE_KEY_LAYOUTS = {
    QWERTY: {
        left: {
            degrees: [
                { key: "a", degreeOffset: 0 },
                { key: "s", degreeOffset: 1 },
                { key: "d", degreeOffset: 2 },
                { key: "f", degreeOffset: 3 },
                { key: "g", degreeOffset: 4 },
                { key: "w", degreeOffset: 5 },
                { key: "e", degreeOffset: 6 },
                { key: "r", degreeOffset: 7 },
            ],
        },
        right: {
            degrees: [
                { key: "h", degreeOffset: 0 },
                { key: "j", degreeOffset: 1 },
                { key: "k", degreeOffset: 2 },
                { key: "l", degreeOffset: 3 },
                { key: ";", degreeOffset: 4 },
                { key: "u", degreeOffset: 5 },
                { key: "i", degreeOffset: 6 },
                { key: "o", degreeOffset: 7 },
            ],
        },
    },
    QWERTZ: {
        left: {
            degrees: [
                { key: "a", degreeOffset: 0 },
                { key: "s", degreeOffset: 1 },
                { key: "d", degreeOffset: 2 },
                { key: "f", degreeOffset: 3 },
                { key: "g", degreeOffset: 4 },
                { key: "w", degreeOffset: 5 },
                { key: "e", degreeOffset: 6 },
                { key: "r", degreeOffset: 7 },
            ],
        },
        right: {
            degrees: [
                { key: "h", degreeOffset: 0 },
                { key: "j", degreeOffset: 1 },
                { key: "k", degreeOffset: 2 },
                { key: "l", degreeOffset: 3 },
                { key: "ö", degreeOffset: 4 },
                { key: "u", degreeOffset: 5 },
                { key: "i", degreeOffset: 6 },
                { key: "o", degreeOffset: 7 },
            ],
        },
    },
};

export const SCALE_PRESETS = [
    { id: "C_MAJOR", label: "CM", root: "C", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "C_MINOR", label: "Cm", root: "C", intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: "D_MAJOR", label: "DM", root: "D", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "D_MINOR", label: "Dm", root: "D", intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: "E_MAJOR", label: "EM", root: "E", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "E_MINOR", label: "Em", root: "E", intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: "F_MAJOR", label: "FM", root: "F", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "F_MINOR", label: "Fm", root: "F", intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: "G_MAJOR", label: "GM", root: "G", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "G_MINOR", label: "Gm", root: "G", intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: "A_MAJOR", label: "AM", root: "A", intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: "A_MINOR", label: "Am", root: "A", intervals: [0, 2, 3, 5, 7, 8, 10] },
];

export const NOTES = generateNotes();

export const SHIFT_KEY_BINDINGS = {
    QWERTY: {
        left: {
            minor_upshift_key: "c",
            minor_downshift_key: "x",
            major_upshift_key: "v",
            major_downshift_key: "z",
        },
        right: {
            minor_upshift_key: ".",
            minor_downshift_key: ",",
            major_upshift_key: "/",
            major_downshift_key: "m",
        },
    },
    QWERTZ: {
        left: {
            minor_upshift_key: "c",
            minor_downshift_key: "x",
            major_upshift_key: "v",
            major_downshift_key: "y",
        },
        right: {
            minor_upshift_key: ",",
            minor_downshift_key: "m",
            major_upshift_key: ".",
            major_downshift_key: "n",
        },
    },
};

export const NAV_KEY_BINDINGS = {
    mode: {
        next: "",
        prev: "",
    },
    root: {
        next: "2",
        prev: "1",
    },
    quality: {
        major: "3",
        minor: "4",
    }

};


export const SINGLE_KEY_LAYOUTS = {
    QWERTY: {
        white: [
            { key: "a", whiteOffset: 0 }, // C
            { key: "s", whiteOffset: 1 }, // D
            { key: "d", whiteOffset: 2 }, // E
            { key: "f", whiteOffset: 3 }, // F
            { key: "g", whiteOffset: 4 }, // G
            { key: "h", whiteOffset: 5 }, // A
            { key: "j", whiteOffset: 6 }, // B
        ],
        black: [
            { key: "q", afterWhiteOffset: -1 }, // C#
            { key: "w", afterWhiteOffset: 0 }, // D#
            { key: "e", afterWhiteOffset: 1 }, // None (E-F)
            { key: "r", afterWhiteOffset: 2 }, // F#
            { key: "t", afterWhiteOffset: 3 }, // G#
            { key: "y", afterWhiteOffset: 4 }, // A#
            { key: "u", afterWhiteOffset: 5 }, // None (B-C)
        ],
    },
    QWERTZ: {
        white: [
            { key: "a", whiteOffset: 0 }, // C
            { key: "s", whiteOffset: 1 }, // D
            { key: "d", whiteOffset: 2 }, // E
            { key: "f", whiteOffset: 3 }, // F
            { key: "g", whiteOffset: 4 }, // G
            { key: "h", whiteOffset: 5 }, // A
            { key: "j", whiteOffset: 6 }, // B
        ],
        black: [
            { key: "q", afterWhiteOffset: -1 }, // C#
            { key: "w", afterWhiteOffset: 0 }, // D#
            { key: "e", afterWhiteOffset: 1 }, // None (E-F)
            { key: "r", afterWhiteOffset: 2 }, // F#
            { key: "t", afterWhiteOffset: 3 }, // G#
            { key: "z", afterWhiteOffset: 4 }, // A# (Y swapped)
            { key: "u", afterWhiteOffset: 5 }, // None (B-C)
        ],
    },
};

export const DUAL_KEY_LAYOUTS = {
    QWERTY: {
        left: {
            white: [
                { key: "a", whiteOffset: 0 },
                { key: "s", whiteOffset: 1 },
                { key: "d", whiteOffset: 2 },
                { key: "f", whiteOffset: 3 },
                { key: "g", whiteOffset: 4 },
            ],
            black: [
                { key: "q", afterWhiteOffset: -1 }, 
                { key: "w", afterWhiteOffset: 0 }, 
                { key: "e", afterWhiteOffset: 1 },
                { key: "r", afterWhiteOffset: 2 }, 
                { key: "t", afterWhiteOffset: 3 }, 
            ],
        },
        right: {
            white: [
                { key: "h", whiteOffset: 0 },
                { key: "j", whiteOffset: 1 },
                { key: "k", whiteOffset: 2 },
                { key: "l", whiteOffset: 3 },
                { key: ";", whiteOffset: 4 },
            ],
            black: [
                { key: "y", afterWhiteOffset: -1 }, 
                { key: "u", afterWhiteOffset: 0 },
                { key: "i", afterWhiteOffset: 1 }, 
                { key: "o", afterWhiteOffset: 2 }, 
                { key: "p", afterWhiteOffset: 3 },
            ],
        },
    },
    QWERTZ: {
        left: {
            white: [
                { key: "a", whiteOffset: 0 },
                { key: "s", whiteOffset: 1 },
                { key: "d", whiteOffset: 2 },
                { key: "f", whiteOffset: 3 },
                { key: "g", whiteOffset: 4 },
            ],
            black: [
                { key: "q", afterWhiteOffset: -1 }, 
                { key: "w", afterWhiteOffset: 0 }, 
                { key: "e", afterWhiteOffset: 1 },
                { key: "r", afterWhiteOffset: 2 }, 
                { key: "t", afterWhiteOffset: 3 }, 
            ],
        },
        right: {
            white: [
                { key: "h", whiteOffset: 0 },
                { key: "j", whiteOffset: 1 },
                { key: "k", whiteOffset: 2 },
                { key: "l", whiteOffset: 3 },
                { key: "ö", whiteOffset: 4 },
            ],
            black: [
                { key: "z", afterWhiteOffset: -1 }, 
                { key: "u", afterWhiteOffset: 0 },
                { key: "i", afterWhiteOffset: 1 }, 
                { key: "o", afterWhiteOffset: 2 }, 
                { key: "p", afterWhiteOffset: 3 },
            ],
        },
    },
};

export const PLAY_MODES = ['STANDARD', 'DUAL', 'SCALE'];
