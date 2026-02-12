import React from 'react';
import { motion, useAnimation } from 'framer-motion';

const CubeFlipElement = ({
  text,
  initialText,
  revealText,
  children,
  flipKey,
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

  const resolvedContent = children ?? text ?? initialText ?? '';
  const resolvedReveal = revealText ?? resolvedContent;
  const isPrimitiveContent =
    typeof resolvedContent === 'string' || typeof resolvedContent === 'number';
  const resolvedFlipKey = flipKey ?? (isPrimitiveContent ? resolvedContent : undefined);
  const resolvedAriaLabel =
    ariaLabel ?? (isPrimitiveContent ? String(resolvedContent) : undefined);

  const [frontContent, setFrontContent] = React.useState(resolvedContent);
  const [backContent, setBackContent] = React.useState(resolvedReveal);
  const lastKeyRef = React.useRef(resolvedFlipKey);

  React.useEffect(() => {
    if (resolvedFlipKey == null) return;
    if (Object.is(resolvedFlipKey, lastKeyRef.current)) return;

    let isActive = true;
    setBackContent(resolvedContent);
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
        setFrontContent(resolvedContent);
        setBackContent(resolvedContent);
        lastKeyRef.current = resolvedFlipKey;
        controls.set({ rotateX: 0, rotateY: 0 });
      });
    return () => {
      isActive = false;
    };
  }, [resolvedFlipKey, resolvedContent, axis, hoverRotation, duration, controls]);

  const backFaceTransform =
    axis === 'X'
      ? `rotateX(${faceRotation}deg) translateZ(var(--cube-depth))`
      : `rotateY(${faceRotation}deg) translateZ(var(--cube-depth))`;

  const renderFront = resolvedFlipKey == null ? resolvedContent : frontContent;
  const renderBack = resolvedFlipKey == null ? resolvedReveal : backContent;

  return (
    <div
      className={`cube-flip ${className}`.trim()}
      style={{ '--cube-depth': depth, ...style }}
      aria-label={resolvedAriaLabel}
    >
      <div className="cube-flip__ghost" aria-hidden="true">
        {renderFront}
      </div>
      <div className="cube-flip__ghost" aria-hidden="true">
        {renderBack}
      </div>
      <motion.div
        className="cube-flip__cube"
        initial={{ rotateX: 0, rotateY: 0 }}
        animate={controls}
      >
        <div
          className="cube-flip__face cube-flip__face--front"
          aria-hidden="true"
          style={{ transform: 'translateZ(var(--cube-depth))' }}
        >
          {renderFront}
        </div>
        <div
          className="cube-flip__face cube-flip__face--back"
          aria-hidden="true"
          style={{ transform: backFaceTransform }}
        >
          {renderBack}
        </div>
      </motion.div>
    </div>
  );
};

export { CubeFlipElement };
export default CubeFlipElement;
