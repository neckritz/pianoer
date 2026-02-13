import React from 'react';
import * as Tone from 'tone';
import './index.css';
import FlyInToast from './components/FlyInToast';
import AppHeader from './components/AppHeader';
import PianoKeyboard from './components/PianoKeyboard';
import { usePianoEngine } from './hooks/usePianoEngine';
import CubeFlipElement from './components/CubeFlipText';
import { SCALE_PRESETS } from './components/notes';
import BackgroundShapes from './components/BackgroundWaves.jsx';

function App() {
    const [hasAudioStarted, setHasAudioStarted] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(true);
    const [isTitleHovered, setIsTitleHovered] = React.useState(false);
    const [uiSettings] = React.useState({
        showNoteNames: false,
        showModeToast: true,
        showScaleToast: true,
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
    const getScaleFlipDirection = React.useCallback((prevScale, nextScale) => {
        if (!prevScale || !nextScale) return 'up';

        const prevRoot = prevScale.root;
        const nextRoot = nextScale.root;
        const prevQuality = getScaleQuality(prevScale);
        const nextQuality = getScaleQuality(nextScale);

        if (prevRoot && nextRoot && prevRoot !== nextRoot) {
            const prevIndex = scaleRoots.indexOf(prevRoot);
            const nextIndex = scaleRoots.indexOf(nextRoot);
            if (prevIndex === -1 || nextIndex === -1) {
                return 'left';
            }
            const diff = (nextIndex - prevIndex + scaleRoots.length) % scaleRoots.length;
            return diff === 0 || diff <= scaleRoots.length / 2 ? 'left' : 'right';
        }

        if (prevQuality !== nextQuality) {
            return nextQuality === 'major' ? 'down' : 'up';
        }

        return 'up';
    }, [getScaleQuality, scaleRoots]);

    const piano = usePianoEngine({
        hasStarted: !isMenuOpen,
        getScaleToastDirection: getScaleFlipDirection,
        enableModeToast: uiSettings.showModeToast,
        enableScaleToast: uiSettings.showScaleToast,
    });
    const [scaleFlip, setScaleFlip] = React.useState(() => ({
        text: piano.currentScale?.label ?? '',
        direction: 'up',
    }));
    const prevScaleRef = React.useRef(piano.currentScale);

    React.useEffect(() => {
        const nextScale = piano.currentScale;
        if (!nextScale) return;
        const prevScale = prevScaleRef.current;

        if (!prevScale) {
            prevScaleRef.current = nextScale;
            setScaleFlip({ text: nextScale.label, direction: 'up' });
            return;
        }

        if (prevScale.label === nextScale.label) {
            prevScaleRef.current = nextScale;
            return;
        }

        const direction = getScaleFlipDirection(prevScale, nextScale);
        prevScaleRef.current = nextScale;
        setScaleFlip({ text: nextScale.label, direction });
    }, [piano.currentScale, getScaleFlipDirection]);

    const handleStart = async () => {
        if (!hasAudioStarted) {
            await Tone.start();
            console.log('Audio Ready');
            setHasAudioStarted(true);
        }
        setIsMenuOpen(false);
    };

    const handleStartKeyDown = (event) => {
        if (!isMenuOpen) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleStart();
        }
    };

    React.useEffect(() => {
        if (!isMenuOpen) {
            setIsTitleHovered(false);
        }
    }, [isMenuOpen]);

    // Escape Key logic: return to menu
    React.useEffect(() => {
        const handleGlobalKey = (e) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(true);
                document.activeElement?.blur()
            }
        };

        window.addEventListener('keydown', handleGlobalKey);

        return () => {
            window.removeEventListener('keydown', handleGlobalKey);
        };
    }, []);

    return (
        <div className="app-container">
            <FlyInToast />
            <BackgroundShapes isHidden={!isMenuOpen || isTitleHovered} />

            {/* 2. HEADER (Always visible) */}
            {false && (
                <AppHeader
                    onOpenSettings={() => setIsMenuOpen(true)}
                    isDualLike={piano.isDualLike}
                    leftShift={piano.leftShift}
                    rightShift={piano.rightShift}
                    leftBounds={piano.leftBounds}
                    rightBounds={piano.rightBounds}
                    singleShiftBounds={piano.singleShiftBounds}
                    onChangeShift={piano.changeShift}
                    currentMode={piano.currentMode}
                    onShiftMode={piano.shiftMode}
                    isScaleMode={piano.isScaleMode}
                    currentScaleLabel={piano.currentScale.label}
                    onShiftScale={piano.shiftScale}
                />
            )}

            {/* 3. MAIN CONTENT */}
            <CubeFlipElement
                isFlipped={!isMenuOpen}
                direction="up"
                duration={.8}
                className="piano-flip"
                depth= "100px"
                front={(
                    <div
                        className="splash-start start-face"
                        role="button"
                        tabIndex={isMenuOpen ? 0 : -1}
                        onClick={handleStart}
                        onKeyDown={handleStartKeyDown}
                        onMouseEnter={() => setIsTitleHovered(true)}
                        onMouseLeave={() => setIsTitleHovered(false)}
                        onFocus={() => setIsTitleHovered(true)}
                        onBlur={() => setIsTitleHovered(false)}
                        aria-label="Start Pianoer"
                        aria-hidden={!isMenuOpen}
                        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
                    >
                        <h1 className="roboto-mono-title">PIANOER</h1>
                    </div>
                )}
                back={(
                    <div
                        className="piano-face"
                        aria-hidden={isMenuOpen}
                        style={{ pointerEvents: isMenuOpen ? 'none' : 'auto' }}
                    >
                        <PianoKeyboard
                            pressedNotes={piano.pressedNotes}
                            playableNotes={piano.playableNotes}
                            onMouseDown={piano.handleMouseDown}
                            onMouseUp={piano.handleMouseUp}
                            showNoteNames={uiSettings.showNoteNames}
                        />
                    </div>
                )}
            />


        </div>
    );
}

export default App;
