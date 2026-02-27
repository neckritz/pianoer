import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/useToast';
import CubeFlipText from './CubeFlipText';

const MotionDiv = motion.div;

const ToastCard = ({ toast, index, variants }) => {
    const contentText = toast.content ?? '';
    const fromText = toast.fromContent ?? contentText;
    const direction = toast.direction ?? 'up';
    const [flipText, setFlipText] = React.useState(fromText);
    const hasFlippedRef = React.useRef(false);
    const hasEnteredRef = React.useRef(false);

    React.useEffect(() => {
        setFlipText(fromText);
        hasFlippedRef.current = false;
    }, [fromText]);

    React.useEffect(() => {
        hasEnteredRef.current = false;
    }, [toast.id]);

    React.useEffect(() => {
        if (!hasEnteredRef.current) return;
        if (contentText === flipText) return;
        setFlipText(contentText);
    }, [contentText, flipText]);

    const handleAnimationComplete = (definition) => {
        if (definition !== 'animate') return;
        hasEnteredRef.current = true;
        if (hasFlippedRef.current) return;
        hasFlippedRef.current = true;
        setFlipText(contentText);
    };

    return (
        <MotionDiv
            key={toast.id} // Important: tells Framer it's a new item
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={handleAnimationComplete}
            style={{
                backgroundColor: '#311109e4',
                color: '#fff',
                width: '100%',
                height: '100%',
                padding: '1.5rem',
                borderRadius: '10px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                textTransform: '',
                letterSpacing: '1px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxSizing: 'border-box',
                gridArea: '1 / 1',
                zIndex: 100 + index
            }}
        >
            <div
                style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}
            >
                {toast.header ?? ''}
            </div>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}
            >
                <CubeFlipText
                    duration = {0.5}
                    text={flipText}
                    direction={direction}
                    ariaLabel={contentText}
                    style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em'
                    }}
                />
            </div>
        </MotionDiv>
    );
};

const FlyInToast = () => {
    const { toasts } = useToast();
    const toastSize = 240;

    // Define the animation states
    const variants = {
        initial: { 
            y: "100vh", // Start way offscreen bottom
            opacity: 0,
            scale: 0.8,
            rotate: -10,
        },
        animate: { 
            y: 0, // Center (wrapper handles centering)
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { type: "spring", stiffness: 300, damping: 25 } // snappy spring
        },
        exit: { 
            y: "-120vh", // Fly offscreen top
            opacity: 0, 
            scale: 0.8,
            transition: { duration: 0.4, ease: "easeInOut" } // Smooth exit
        }
    };

    return (
        // Container to center items on screen without interfering with layout
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none', // let clicks pass through
            zIndex: 9999
        }}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${toastSize}px`,
                height: `${toastSize}px`,
                display: 'grid',
                placeItems: 'center'
            }}>
                {/* AnimatePresence detects when a toast is removed and runs exit anim */}
                <AnimatePresence>
                    {toasts.map((toast, index) => (
                        <ToastCard
                            key={toast.id}
                            toast={toast}
                            index={index}
                            variants={variants}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FlyInToast;
