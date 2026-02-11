import React from 'react';
import { motion, useAnimation } from 'framer-motion';

const CubeFlipText = ({
  text,
  initialText,
  revealText,
  direction = 'up',
  duration = 0.45,
  depth = '0.6em',
  className = '',
  style,
  ariaLabel,
}) => {
  const normalized = String(direction).toLowerCase();
  const isHorizontal = normalized === 'left' || normalized === 'right';
  const axis = isHorizontal ? 'Y' : 'X';
  const hoverRotation =
    normalized === 'down' || normalized === 'left' ? -90 : 90;
  const faceRotation = -hoverRotation;
  const controls = useAnimation();
  const resolvedText = text ?? initialText ?? '';
  const [frontText, setFrontText] = React.useState(resolvedText);
  const [backText, setBackText] = React.useState(revealText ?? resolvedText);
  const lastTextRef = React.useRef(resolvedText);

  React.useEffect(() => {
    const nextText = text ?? initialText ?? '';
    if (nextText === lastTextRef.current) return;

    let isActive = true;
    setBackText(nextText);
    controls.stop();
    controls.set({ rotateX: 0, rotateY: 0 });
    controls
      .start({
        rotateX: axis === 'X' ? hoverRotation : 0,
        rotateY: axis === 'Y' ? hoverRotation : 0,
        transition: { duration, ease: [0.22, 1, 0.36, 1] },
      })
      .then(() => {
        if (!isActive) return;
        setFrontText(nextText);
        setBackText(nextText);
        lastTextRef.current = nextText;
        controls.set({ rotateX: 0, rotateY: 0 });
      });
    return () => {
      isActive = false;
    };
  }, [text, initialText, axis, hoverRotation, duration, controls]);

  const backFaceTransform =
    axis === 'X'
      ? `rotateX(${faceRotation}deg) translateZ(var(--cube-depth))`
      : `rotateY(${faceRotation}deg) translateZ(var(--cube-depth))`;

  return (
    <span
      className={`cube-flip ${className}`.trim()}
      style={{ '--cube-depth': depth, ...style }}
      aria-label={ariaLabel ?? resolvedText}
    >
      <span className="cube-flip__ghost" aria-hidden="true">
        {frontText}
      </span>
      <span className="cube-flip__ghost" aria-hidden="true">
        {backText}
      </span>
      <motion.span
        className="cube-flip__cube"
        initial={{ rotateX: 0, rotateY: 0 }}
        animate={controls}
      >
        <span
          className="cube-flip__face cube-flip__face--front"
          aria-hidden="true"
          style={{ transform: 'translateZ(var(--cube-depth))' }}
        >
          {frontText}
        </span>
        <span
          className="cube-flip__face cube-flip__face--back"
          aria-hidden="true"
          style={{ transform: backFaceTransform }}
        >
          {backText}
        </span>
      </motion.span>
    </span>
  );
};

export default CubeFlipText;
