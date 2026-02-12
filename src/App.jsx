import React from 'react';
import * as Tone from 'tone';
import './index.css';
import FlyInToast from './components/FlyInToast';
import SettingsModal from './components/SettingsModal';
import AppHeader from './components/AppHeader';
import SplashScreen from './components/SplashScreen';
import PianoKeyboard from './components/PianoKeyboard';
import { usePianoEngine } from './hooks/usePianoEngine';
import CubeFlipText from './components/CubeFlipText';
import { SCALE_PRESETS } from './components/notes';

function App() {
    const [hasStarted, setHasStarted] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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

    const piano = usePianoEngine({ hasStarted, getScaleToastDirection: getScaleFlipDirection });
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
        await Tone.start();
        console.log('Audio Ready');
        setHasStarted(true);
    };

    // Escape Key logic
    React.useEffect(() => {
        const handleGlobalKey = (e) => {
            if (e.key === 'Escape') {
                setIsSettingsOpen((prev) => !prev);
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
        

            {/* 1. GLOBAL UI (Always loaded) */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentLayout={piano.layout}
                onToggleLayout={piano.toggleLayout}
            />

            {/* 2. HEADER (Always visible) */}
            {hasStarted ? false ? <AppHeader
                onOpenSettings={() => setIsSettingsOpen(true)}
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
            /> : null : null}

            {/* 3. CONDITIONAL CONTENT */}
            {!hasStarted ? (
                <SplashScreen onStart={handleStart} />
            ) : (
                <PianoKeyboard
                    pressedNotes={piano.pressedNotes}
                    playableNotes={piano.playableNotes}
                    onMouseDown={piano.handleMouseDown}
                    onMouseUp={piano.handleMouseUp}
                />
            )}


        </div>
    );
}

export default App;
