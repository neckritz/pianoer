import React from 'react';
import * as Tone from 'tone';
import {
    SINGLE_KEY_LAYOUTS,
    DUAL_KEY_LAYOUTS,
    SCALE_KEY_LAYOUTS,
    SCALE_PRESETS,
    SHIFT_KEY_BINDINGS,
    NAV_KEY_BINDINGS,
    NOTES,
    PLAY_MODES,
} from '../components/notes';
import { startTone, stopTone, stopAllTones } from '../audio';
import { useToast } from '../context/useToast';
import { noteToPitchClass } from '../components/utils';

const MINOR_KEY_SHIFT_STEP = 2; // jump by white keys
const MAJOR_KEY_SHIFT_STEP = 3; // jump by white keys
const FEEL_WINDOW_MS = 4000;
const FEEL_RANGES = {
    low: { min: 21, max: 60 },   // A0 - C4 (wider)
    mid: { min: 36, max: 84 },   // C2 - C6 (wider overlap across range)
    high: { min: 64, max: 108 }, // E4 - C8 (wider)
};
const FEEL_GAIN = 1.15; // Slight global boost to feel intensity

export const usePianoEngine = ({
    hasStarted,
    getScaleToastDirection,
    enableModeToast = true,
    enableScaleToast = true,
} = {}) => {
    const [pressedNotes, setPressedNotes] = React.useState([]);
    const [layout, setLayout] = React.useState('QWERTY');
    const [leftShift, setLeftShift] = React.useState(-10);
    const [rightShift, setRightShift] = React.useState(10);
    const activeKeyMap = React.useRef({});
    const [pressedInputKeys, setPressedInputKeys] = React.useState([]);
    const pressedInputKeysRef = React.useRef(new Set());
    const [modeIndex, setModeIndex] = React.useState(() => {
        const scaleModeIndex = PLAY_MODES.indexOf('SCALE');
        return scaleModeIndex === -1 ? 0 : scaleModeIndex;
    });
    const currentMode = PLAY_MODES[modeIndex];
    const modeIndexRef = React.useRef(modeIndex);
    const isDual = currentMode === 'DUAL';
    const isScaleMode = currentMode === 'SCALE';
    const [scaleIndex, setScaleIndex] = React.useState(0);
    const currentScale = SCALE_PRESETS[scaleIndex];
    const scaleIndexRef = React.useRef(scaleIndex);
    const { showToast } = useToast();
    const [playFeel, setPlayFeel] = React.useState({
        low: 0,
        mid: 0,
        high: 0,
    });
    const playFeelRef = React.useRef({
        low: [],
        mid: [],
        high: [],
    });
    const scaleRoots = React.useMemo(() => {
        const seen = new Set();
        return SCALE_PRESETS.reduce((acc, preset) => {
            if (!preset?.root) return acc;
            if (seen.has(preset.root)) return acc;
            seen.add(preset.root);
            acc.push(preset.root);
            return acc;
        }, []);
    }, []);
    const getScaleQuality = React.useCallback((scale) => {
        const id = `${scale?.id || ''}`.toLowerCase();
        if (id.includes('minor')) return 'minor';
        if (id.includes('major')) return 'major';
        const label = `${scale?.label || ''}`;
        if (label.endsWith('m')) return 'minor';
        return 'major';
    }, []);
    const noteToMidi = React.useCallback((noteString) => {
        const match = noteString.match(/^([A-G])(#?)(\d)$/);
        if (!match) return null;
        const [, letter, sharp, octaveRaw] = match;
        const base = {
            C: 0,
            D: 2,
            E: 4,
            F: 5,
            G: 7,
            A: 9,
            B: 11,
        }[letter];
        const octave = Number(octaveRaw);
        if (!Number.isFinite(octave)) return null;
        const accidental = sharp ? 1 : 0;
        return (octave + 1) * 12 + base + accidental;
    }, []);
    const computePlayFeel = React.useCallback((now) => {
        const cutoff = now - FEEL_WINDOW_MS;
        const buckets = playFeelRef.current;
        const prune = (arr) => {
            let idx = 0;
            while (idx < arr.length && arr[idx].t < cutoff) idx += 1;
            if (idx > 0) arr.splice(0, idx);
        };
        prune(buckets.low);
        prune(buckets.mid);
        prune(buckets.high);

        const windowSeconds = FEEL_WINDOW_MS / 1000;
        const sumWeights = (arr) => arr.reduce((sum, item) => sum + item.w, 0);
        return {
            low: (sumWeights(buckets.low) / windowSeconds) * FEEL_GAIN,
            mid: (sumWeights(buckets.mid) / windowSeconds) * FEEL_GAIN,
            high: (sumWeights(buckets.high) / windowSeconds) * FEEL_GAIN,
        };
    }, []);

    const applyPlayFeel = React.useCallback((nextFeel, shouldLog = false) => {
        setPlayFeel((prev) => {
            if (!prev) return nextFeel;
            const same = Math.abs(prev.low - nextFeel.low) < 0.001
                && Math.abs(prev.mid - nextFeel.mid) < 0.001
                && Math.abs(prev.high - nextFeel.high) < 0.001;
            return same ? prev : nextFeel;
        });
        if (shouldLog) {
            console.log('play-feel (notes/sec)', {
                low: Number(nextFeel.low.toFixed(2)),
                mid: Number(nextFeel.mid.toFixed(2)),
                high: Number(nextFeel.high.toFixed(2)),
            });
        }
    }, []);

    const updatePlayFeel = React.useCallback((noteName) => {
        const midi = noteToMidi(noteName);
        if (midi == null) return;
        const now = Date.now();
        const buckets = playFeelRef.current;
        const lerp = (from, to, t) => from + (to - from) * t;
        const addIfInRange = (range, target, weight = 1) => {
            if (midi >= range.min && midi <= range.max) {
                target.push({ t: now, w: weight });
            }
        };
        if (midi >= FEEL_RANGES.low.min && midi <= FEEL_RANGES.low.max) {
            const t = (midi - FEEL_RANGES.low.min) / (FEEL_RANGES.low.max - FEEL_RANGES.low.min || 1);
            const weight = lerp(1.5, 0.5, Math.min(Math.max(t, 0), 1));
            addIfInRange(FEEL_RANGES.low, buckets.low, weight);
        }
        addIfInRange(FEEL_RANGES.mid, buckets.mid, 1);
        if (midi >= FEEL_RANGES.high.min && midi <= FEEL_RANGES.high.max) {
            const t = (midi - FEEL_RANGES.high.min) / (FEEL_RANGES.high.max - FEEL_RANGES.high.min || 1);
            const weight = lerp(0.5, 1.5, Math.min(Math.max(t, 0), 1));
            addIfInRange(FEEL_RANGES.high, buckets.high, weight);
        }

        const nextFeel = computePlayFeel(now);
        applyPlayFeel(nextFeel, true);
    }, [noteToMidi, computePlayFeel, applyPlayFeel]);
    const applyScaleIndex = React.useCallback((nextIndex) => {
        if (!Number.isInteger(nextIndex)) return;
        if (nextIndex < 0 || nextIndex >= SCALE_PRESETS.length) return;
        if (nextIndex === scaleIndexRef.current) return;
        const prevScale = SCALE_PRESETS[scaleIndexRef.current];
        const nextScale = SCALE_PRESETS[nextIndex];
        const direction = typeof getScaleToastDirection === 'function'
            ? getScaleToastDirection(prevScale, nextScale)
            : 'up';
        scaleIndexRef.current = nextIndex;
        setScaleIndex(nextIndex);
        if (enableScaleToast) {
            showToast("SCALE", `${nextScale.label}`, {
                direction,
                fromContent: prevScale?.label,
                key: 'scale'
            });
        }
    }, [showToast, getScaleToastDirection, enableScaleToast]);
    const getScaleIndexFor = React.useCallback((root, quality) => {
        if (!root) return null;
        const normalizedRoot = `${root}`.toUpperCase();
        const normalizedQuality = `${quality}`.toLowerCase() === 'minor' ? 'minor' : 'major';
        let match = SCALE_PRESETS.findIndex(
            (preset) => preset.root === normalizedRoot && getScaleQuality(preset) === normalizedQuality
        );
        if (match === -1) {
            match = SCALE_PRESETS.findIndex((preset) => preset.root === normalizedRoot);
        }
        return match === -1 ? null : match;
    }, [getScaleQuality]);
    const setScaleRoot = React.useCallback((root) => {
        const currentQuality = getScaleQuality(SCALE_PRESETS[scaleIndexRef.current]);
        const nextIndex = getScaleIndexFor(root, currentQuality);
        if (nextIndex === null) return;
        applyScaleIndex(nextIndex);
    }, [applyScaleIndex, getScaleQuality, getScaleIndexFor]);
    const setScaleQuality = React.useCallback((quality) => {
        const currentRoot = SCALE_PRESETS[scaleIndexRef.current]?.root;
        if (!currentRoot) return;
        const nextIndex = getScaleIndexFor(currentRoot, quality);
        if (nextIndex === null) return;
        applyScaleIndex(nextIndex);
    }, [applyScaleIndex, getScaleIndexFor]);
    const shiftScaleQuality = React.useCallback((delta) => {
        const currentScale = SCALE_PRESETS[scaleIndexRef.current];
        if (!currentScale) return;
        const currentQuality = getScaleQuality(currentScale);
        const qualities = ['major', 'minor'];
        const currentIndex = qualities.indexOf(currentQuality);
        const step = delta >= 0 ? 1 : -1;
        const nextQuality = qualities[(currentIndex + step + qualities.length) % qualities.length];
        setScaleQuality(nextQuality);
    }, [getScaleQuality, setScaleQuality]);

    // Precompute indices of white keys so shifts use white positions instead of raw semitones
    const whiteNoteIndices = React.useMemo(
        () => NOTES.map((n, idx) => n.type === 'white' ? idx : null).filter((idx) => idx !== null),
        []
    );
    const baseNoteIndex = React.useMemo(
        () => NOTES.findIndex((n) => n.note === 'C4'),
        []
    );
    const baseWhitePosition = React.useMemo(
        () => whiteNoteIndices.indexOf(baseNoteIndex),
        [whiteNoteIndices, baseNoteIndex]
    );

    const computeShiftBounds = React.useCallback((handLayout) => {
        const offsets = (handLayout.white || [])
            .map((b) => b.whiteOffset)
            .filter((o) => typeof o === 'number');
        const minOffset = offsets.length ? Math.min(...offsets) : 0;
        const maxOffset = offsets.length ? Math.max(...offsets) : 0;
        const min = -baseWhitePosition - minOffset;
        const max = whiteNoteIndices.length - 1 - baseWhitePosition - maxOffset;
        return { min, max };
    }, [baseWhitePosition, whiteNoteIndices]);

    const singleLayout = React.useMemo(
        () => SINGLE_KEY_LAYOUTS[layout] || { white: [], black: [] },
        [layout]
    );
    const dualLayout = React.useMemo(
        () => DUAL_KEY_LAYOUTS[layout] || { left: { white: [], black: [] }, right: { white: [], black: [] } },
        [layout]
    );
    const scaleLayout = React.useMemo(
        () => SCALE_KEY_LAYOUTS[layout] || { left: { degrees: [] }, right: { degrees: [] } },
        [layout]
    );
    const shiftBindings = React.useMemo(
        () => SHIFT_KEY_BINDINGS[layout] || { left: {}, right: {} },
        [layout]
    );
    const navBindings = React.useMemo(() => {
        const mode = NAV_KEY_BINDINGS?.mode || {};
        const root = NAV_KEY_BINDINGS?.root || {};
        const quality = NAV_KEY_BINDINGS?.quality || {};
        const rootByKey = {};

        if (root && typeof root === 'object') {
            Object.entries(root).forEach(([name, value]) => {
                if (name === 'next' || name === 'prev') return;
                if (typeof value !== 'string') return;
                const normalized = `${name}`.trim();
                if (!normalized) return;
                rootByKey[value.toLowerCase()] = normalized.toUpperCase();
            });
        }

        return {
            modeNext: typeof mode.next === 'string' ? mode.next.toLowerCase() : null,
            modePrev: typeof mode.prev === 'string' ? mode.prev.toLowerCase() : null,
            rootNext: typeof root.next === 'string' ? root.next.toLowerCase() : null,
            rootPrev: typeof root.prev === 'string' ? root.prev.toLowerCase() : null,
            qualityMajor: typeof quality.major === 'string' ? quality.major.toLowerCase() : null,
            qualityMinor: typeof quality.minor === 'string' ? quality.minor.toLowerCase() : null,
            rootByKey,
        };
    }, []);
    const singleShiftBounds = React.useMemo(
        () => computeShiftBounds(singleLayout),
        [singleLayout, computeShiftBounds]
    );
    const dualShiftBounds = React.useMemo(
        () => ({
            left: computeShiftBounds(dualLayout.left || { white: [] }),
            right: computeShiftBounds(dualLayout.right || { white: [] }),
        }),
        [dualLayout, computeShiftBounds]
    );
    const scaleNoteIndices = React.useMemo(() => {
        const rootPitch = noteToPitchClass(currentScale.root);
        if (rootPitch === null) return [];
        const allowed = new Set(currentScale.intervals.map((i) => (rootPitch + i) % 12));

        return NOTES.reduce((acc, item, idx) => {
            const pc = noteToPitchClass(item.note);
            if (pc === null) return acc;
            if (allowed.has(pc)) acc.push(idx);
            return acc;
        }, []);
    }, [currentScale]);

    const findScaleStartIndex = React.useCallback((shift) => {
        if (!scaleNoteIndices.length) return null;
        const anchorWhitePos = baseWhitePosition + shift;
        const anchorNoteIndex = whiteNoteIndices[anchorWhitePos];
        if (typeof anchorNoteIndex !== 'number') return null;

        const firstIndex = scaleNoteIndices.findIndex((idx) => idx >= anchorNoteIndex);
        let startIndex = firstIndex === -1 ? scaleNoteIndices.length - 7 : firstIndex;
        if (startIndex < 0) return null;

        if (startIndex + 6 >= scaleNoteIndices.length) {
            startIndex = Math.max(scaleNoteIndices.length - 7, 0);
        }

        return startIndex;
    }, [baseWhitePosition, whiteNoteIndices, scaleNoteIndices]);

    const scaleShiftBounds = React.useMemo(() => {
        const minCandidate = -baseWhitePosition;
        const maxCandidate = whiteNoteIndices.length - 1 - baseWhitePosition;
        const validShifts = [];

        for (let s = minCandidate; s <= maxCandidate; s += 1) {
            const startIndex = findScaleStartIndex(s);
            if (startIndex === null) continue;
            if (startIndex + 6 < scaleNoteIndices.length) {
                validShifts.push(s);
            }
        }

        if (!validShifts.length) {
            return { left: { min: 0, max: 0 }, right: { min: 0, max: 0 } };
        }

        const min = Math.min(...validShifts);
        const max = Math.max(...validShifts);
        return { left: { min, max }, right: { min, max } };
    }, [baseWhitePosition, whiteNoteIndices, findScaleStartIndex, scaleNoteIndices]);

    const clampShift = React.useCallback(
        (value, bounds) => Math.min(Math.max(value, bounds.min), bounds.max),
        []
    );

    // Shift is tracked per hand so dual mode can move independently.
    const changeShift = React.useCallback((hand, delta) => {
        const bounds = isScaleMode
            ? scaleShiftBounds[hand]
            : isDual
                ? dualShiftBounds[hand]
                : singleShiftBounds;
        const setter = hand === 'right' ? setRightShift : setLeftShift;
        setter((prev) => clampShift(prev + delta, bounds));
    }, [isDual, isScaleMode, dualShiftBounds, singleShiftBounds, scaleShiftBounds, clampShift]);

    const resolveWhiteNote = React.useCallback((whiteOffset, shift) => {
        const targetWhitePos = baseWhitePosition + shift + whiteOffset;
        const noteIndex = whiteNoteIndices[targetWhitePos];
        return typeof noteIndex === 'number' ? NOTES[noteIndex] : null;
    }, [baseWhitePosition, whiteNoteIndices]);

    const resolveBlackNote = React.useCallback((afterWhiteOffset, shift) => {
        const leftWhitePos = baseWhitePosition + shift + afterWhiteOffset;
        const leftNoteIndex = whiteNoteIndices[leftWhitePos];
        if (typeof leftNoteIndex !== 'number') return null;
        const candidateIndex = leftNoteIndex + 1;
        const candidateNote = NOTES[candidateIndex];
        return candidateNote && candidateNote.type === 'black' ? candidateNote : null;
    }, [baseWhitePosition, whiteNoteIndices]);

    const resolveScaleNote = React.useCallback((degreeOffset, shift) => {
        const startIndex = findScaleStartIndex(shift);
        if (startIndex === null) return null;

        const targetIndex = startIndex + degreeOffset;
        const noteIndex = scaleNoteIndices[targetIndex];
        return typeof noteIndex === 'number' ? NOTES[noteIndex] : null;
    }, [findScaleStartIndex, scaleNoteIndices]);

    const computePlayableSet = React.useCallback((handLayout, shift, mode = 'standard') => {
        const notesSet = new Set();

        if (mode === 'scale') {
            (handLayout.degrees || []).forEach(({ degreeOffset }) => {
                if (typeof degreeOffset !== 'number') return;
                const note = resolveScaleNote(degreeOffset, shift);
                if (note) notesSet.add(note.note);
            });
            return notesSet;
        }

        (handLayout.white || []).forEach(({ whiteOffset }) => {
            if (typeof whiteOffset !== 'number') return;
            const note = resolveWhiteNote(whiteOffset, shift);
            if (note) notesSet.add(note.note);
        });

        (handLayout.black || []).forEach(({ afterWhiteOffset }) => {
            if (typeof afterWhiteOffset !== 'number') return;
            const note = resolveBlackNote(afterWhiteOffset, shift);
            if (note) notesSet.add(note.note);
        });

        return notesSet;
    }, [resolveWhiteNote, resolveBlackNote, resolveScaleNote]);

    const playableNotes = React.useMemo(() => {
        if (isScaleMode) {
            const leftSet = computePlayableSet(scaleLayout.left || {}, leftShift, 'scale');
            const rightSet = computePlayableSet(scaleLayout.right || {}, rightShift, 'scale');
            const combined = new Set([...leftSet, ...rightSet]);
            return { left: leftSet, right: rightSet, combined };
        }

        if (isDual) {
            const leftSet = computePlayableSet(dualLayout.left || {}, leftShift);
            const rightSet = computePlayableSet(dualLayout.right || {}, rightShift);
            const combined = new Set([...leftSet, ...rightSet]);
            return { left: leftSet, right: rightSet, combined };
        }

        const singleSet = computePlayableSet(singleLayout, leftShift);
        return { left: singleSet, right: singleSet, combined: singleSet };
    }, [isDual, isScaleMode, scaleLayout, dualLayout, singleLayout, leftShift, rightShift, computePlayableSet]);

    React.useEffect(() => {
        modeIndexRef.current = modeIndex;
    }, [modeIndex]);

    React.useEffect(() => {
        scaleIndexRef.current = scaleIndex;
    }, [scaleIndex]);

    const updatePressedNotes = React.useCallback(() => {
        // Keeps pressed highlighting accurate when multiple sources share one note.
        const uniqueNotes = [...new Set(Object.values(activeKeyMap.current).map((entry) => entry.note))];
        setPressedNotes(uniqueNotes);
    }, []);

    const stopAllPlaying = React.useCallback(() => {
        Object.values(activeKeyMap.current).forEach(({ note }) => stopTone(note));
        stopAllTones(); // extra safety to avoid any stuck voices
        activeKeyMap.current = {};
        updatePressedNotes();
    }, [updatePressedNotes]);

    const shiftMode = React.useCallback((shift, options = {}) => {
        const previousMode = PLAY_MODES[modeIndexRef.current];
        const next = (modeIndexRef.current + shift + PLAY_MODES.length) % PLAY_MODES.length;
        modeIndexRef.current = next;
        setModeIndex(next);
        const direction = typeof options?.direction === 'string'
            ? options.direction
            : shift < 0
                ? 'up'
                : 'down';
        if (enableModeToast) {
            showToast("MODE", `${PLAY_MODES[next]}`, {
                key: 'mode',
                direction,
                fromContent: previousMode,
            });
        }
        console.log(`Mode shift: ${shift}`);
    }, [showToast, enableModeToast]);

    const shiftScale = React.useCallback((delta) => {
        if (!scaleRoots.length) return;
        const currentRoot = SCALE_PRESETS[scaleIndexRef.current]?.root;
        let rootIndex = scaleRoots.indexOf(currentRoot);
        if (rootIndex === -1) rootIndex = 0;
        const nextRoot = scaleRoots[(rootIndex + delta + scaleRoots.length) % scaleRoots.length];
        setScaleRoot(nextRoot);
    }, [scaleRoots, setScaleRoot]);

    const normalizeInputKey = React.useCallback((rawKey) => {
        if (typeof rawKey !== 'string') return null;
        const normalized = rawKey.toLowerCase();
        return normalized || null;
    }, []);

    const addPressedInputKey = React.useCallback((rawKey) => {
        const key = normalizeInputKey(rawKey);
        if (!key) return { key: null, isNew: false };
        const activeKeys = pressedInputKeysRef.current;
        const isNew = !activeKeys.has(key);
        if (isNew) {
            activeKeys.add(key);
            setPressedInputKeys(Array.from(activeKeys));
        }
        return { key, isNew };
    }, [normalizeInputKey]);

    const removePressedInputKey = React.useCallback((rawKey) => {
        const key = normalizeInputKey(rawKey);
        if (!key) return null;
        const activeKeys = pressedInputKeysRef.current;
        if (activeKeys.has(key)) {
            activeKeys.delete(key);
            setPressedInputKeys(Array.from(activeKeys));
        }
        return key;
    }, [normalizeInputKey]);

    const resetPressedInputKeys = React.useCallback(() => {
        if (!pressedInputKeysRef.current.size) return;
        pressedInputKeysRef.current.clear();
        setPressedInputKeys([]);
    }, []);

    // MASTER FUNCTION: Starts a note
    // identifier: A unique ID for the source (e.g., keyboard key "a" or mouse "click-C4")
    // noteName: The resolved note (e.g., "C4")
    const triggerNoteStart = React.useCallback((identifier, noteName, hand = null) => {
        Tone.start();

        activeKeyMap.current[identifier] = { note: noteName, hand };
        startTone(noteName);
        updatePressedNotes();
        updatePlayFeel(noteName);
    }, [updatePressedNotes, updatePlayFeel]);

    // MASTER FUNCTION: Stops a note
    const triggerNoteStop = React.useCallback((identifier) => {
        const playingEntry = activeKeyMap.current[identifier];
        if (playingEntry) {
            stopTone(playingEntry.note);
            delete activeKeyMap.current[identifier];
        }

        updatePressedNotes();
    }, [updatePressedNotes]);

    const handleInputKeyDown = React.useCallback((key) => {
        if (!key) return;

        if (isScaleMode) {
            if (navBindings.qualityMajor && key === navBindings.qualityMajor) {
                shiftScaleQuality(1);
                return;
            }
            if (navBindings.qualityMinor && key === navBindings.qualityMinor) {
                shiftScaleQuality(-1);
                return;
            }
            if (navBindings.rootByKey?.[key]) {
                setScaleRoot(navBindings.rootByKey[key]);
                return;
            }
            if (navBindings.rootNext && key === navBindings.rootNext) {
                shiftScale(1);
                return;
            }
            if (navBindings.rootPrev && key === navBindings.rootPrev) {
                shiftScale(-1);
                return;
            }
        }

        const matchShiftKey = (bindings, hand) => {
            if (bindings?.minor_upshift_key && key === bindings.minor_upshift_key.toLowerCase()) {
                changeShift(hand, MINOR_KEY_SHIFT_STEP);
                return true;
            }
            if (bindings?.minor_downshift_key && key === bindings.minor_downshift_key.toLowerCase()) {
                changeShift(hand, -MINOR_KEY_SHIFT_STEP);
                return true;
            }
            if (bindings?.major_upshift_key && key === bindings.major_upshift_key.toLowerCase()) {
                changeShift(hand, MAJOR_KEY_SHIFT_STEP);
                return true;
            }
            if (bindings?.major_downshift_key && key === bindings.major_downshift_key.toLowerCase()) {
                changeShift(hand, -MAJOR_KEY_SHIFT_STEP);
                return true;
            }
            return false;
        };

        if (isScaleMode) {
            if (matchShiftKey(shiftBindings.left, 'left')) return;
            if (matchShiftKey(shiftBindings.right, 'right')) return;
        } else if (isDual) {
            if (matchShiftKey(shiftBindings.left, 'left')) return;
            if (matchShiftKey(shiftBindings.right, 'right')) return;
        } else if (matchShiftKey(shiftBindings.left, 'left')) {
            return;
        }

        // Mode switching
        if (navBindings.modeNext && key === navBindings.modeNext) {
            shiftMode(1);
            return;
        }
        if (navBindings.modePrev && key === navBindings.modePrev) {
            shiftMode(-1);
            return;
        }

        const resolveHandBinding = (handLayout, shift, hand) => {
            const whiteBinding = (handLayout.white || []).find(({ key: bindingKey }) => bindingKey === key);
            if (whiteBinding && typeof whiteBinding.whiteOffset === 'number') {
                const note = resolveWhiteNote(whiteBinding.whiteOffset, shift);
                if (note) return { note: note.note, hand };
            }
            const blackBinding = (handLayout.black || []).find(({ key: bindingKey }) => bindingKey === key);
            if (blackBinding && typeof blackBinding.afterWhiteOffset === 'number') {
                const note = resolveBlackNote(blackBinding.afterWhiteOffset, shift);
                if (note) return { note: note.note, hand };
            }
            return null;
        };

        const resolveScaleBinding = (handLayout, shift, hand) => {
            const degreeBinding = (handLayout.degrees || []).find(({ key: bindingKey }) => bindingKey === key);
            if (degreeBinding && typeof degreeBinding.degreeOffset === 'number') {
                const note = resolveScaleNote(degreeBinding.degreeOffset, shift);
                if (note) return { note: note.note, hand };
            }
            return null;
        };

        if (isScaleMode) {
            const leftMatch = resolveScaleBinding(scaleLayout.left || {}, leftShift, 'left');
            if (leftMatch) {
                triggerNoteStart(key, leftMatch.note, leftMatch.hand);
                return;
            }
            const rightMatch = resolveScaleBinding(scaleLayout.right || {}, rightShift, 'right');
            if (rightMatch) {
                triggerNoteStart(key, rightMatch.note, rightMatch.hand);
                return;
            }
        } else if (isDual) {
            const leftMatch = resolveHandBinding(dualLayout.left || {}, leftShift, 'left');
            if (leftMatch) {
                triggerNoteStart(key, leftMatch.note, leftMatch.hand);
                return;
            }
            const rightMatch = resolveHandBinding(dualLayout.right || {}, rightShift, 'right');
            if (rightMatch) {
                triggerNoteStart(key, rightMatch.note, rightMatch.hand);
                return;
            }
        } else {
            const singleMatch = resolveHandBinding(singleLayout, leftShift, 'left');
            if (singleMatch) {
                triggerNoteStart(key, singleMatch.note, singleMatch.hand);
            }
        }
    }, [
        isScaleMode,
        navBindings,
        shiftScaleQuality,
        setScaleRoot,
        shiftScale,
        changeShift,
        shiftBindings,
        isDual,
        shiftMode,
        resolveWhiteNote,
        resolveBlackNote,
        resolveScaleNote,
        scaleLayout,
        leftShift,
        rightShift,
        triggerNoteStart,
        dualLayout,
        singleLayout,
    ]);

    const triggerInputDown = React.useCallback((rawKey) => {
        if (!hasStarted) return;
        const { key, isNew } = addPressedInputKey(rawKey);
        if (!key || !isNew) return;
        handleInputKeyDown(key);
    }, [hasStarted, addPressedInputKey, handleInputKeyDown]);

    const triggerInputUp = React.useCallback((rawKey) => {
        const key = removePressedInputKey(rawKey);
        if (!key) return;
        if (activeKeyMap.current[key]) {
            triggerNoteStop(key);
        }
    }, [removePressedInputKey, triggerNoteStop]);

    // Keyboard logic
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.repeat) return;
            triggerInputDown(e.key);
        };

        const handleKeyUp = (e) => {
            triggerInputUp(e.key);
        };

        const handleWindowBlur = () => {
            stopAllPlaying();
            resetPressedInputKeys();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [
        triggerInputDown,
        triggerInputUp,
        stopAllPlaying,
        resetPressedInputKeys,
    ]);

    React.useEffect(() => {
        stopAllPlaying();
    }, [currentMode, stopAllPlaying]);

    React.useEffect(() => {
        if (!hasStarted) {
            setPlayFeel({ low: 0, mid: 0, high: 0 });
            resetPressedInputKeys();
            return undefined;
        }

        const intervalId = setInterval(() => {
            const nextFeel = computePlayFeel(Date.now());
            applyPlayFeel(nextFeel, false);
        }, 60);

        return () => clearInterval(intervalId);
    }, [hasStarted, computePlayFeel, applyPlayFeel, resetPressedInputKeys]);

    React.useEffect(() => {
        if (isScaleMode) {
            setLeftShift((prev) => clampShift(prev, scaleShiftBounds.left));
            setRightShift((prev) => clampShift(prev, scaleShiftBounds.right));
        } else if (isDual) {
            setLeftShift((prev) => clampShift(prev, dualShiftBounds.left));
            setRightShift((prev) => clampShift(prev, dualShiftBounds.right));
        } else {
            setLeftShift((prev) => clampShift(prev, singleShiftBounds));
        }
    }, [layout, isDual, isScaleMode, dualShiftBounds, singleShiftBounds, scaleShiftBounds, clampShift]);

    const handleMouseDown = React.useCallback((note) => {
        // Use 'note' as the ID since mouse clicks don't have a "key code"
        triggerNoteStart(note, note);
    }, [triggerNoteStart]);

    const handleMouseUp = React.useCallback((note) => {
        triggerNoteStop(note);
    }, [triggerNoteStop]);

    const toggleLayout = React.useCallback(() => {
        setLayout((prev) => prev === 'QWERTY' ? 'QWERTZ' : 'QWERTY');
    }, []);

    const setLayoutMode = React.useCallback((nextLayout) => {
        if (nextLayout !== 'QWERTY' && nextLayout !== 'QWERTZ') return;
        setLayout(nextLayout);
    }, []);

    const isDualLike = isDual || isScaleMode;
    const leftBounds = isScaleMode ? scaleShiftBounds.left : dualShiftBounds.left;
    const rightBounds = isScaleMode ? scaleShiftBounds.right : dualShiftBounds.right;

    return {
        layout,
        toggleLayout,
        setLayoutMode,
        currentMode,
        currentScale,
        isDual,
        isScaleMode,
        isDualLike,
        leftShift,
        rightShift,
        leftBounds,
        rightBounds,
        singleShiftBounds,
        changeShift,
        shiftMode,
        shiftScale,
        playableNotes,
        pressedNotes,
        handleMouseDown,
        handleMouseUp,
        playFeel,
        pressedInputKeys,
        triggerInputDown,
        triggerInputUp,
    };
};
