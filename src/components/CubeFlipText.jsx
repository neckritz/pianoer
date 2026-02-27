import React from 'react';
import { motion, useAnimation } from 'framer-motion';

const MotionDiv = motion.div;

const CubeFlipElement = ({
  text,
  initialText,
  revealText,
  children,
  front,
  back,
  isFlipped,
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
  const isControlledFlip = typeof isFlipped === 'boolean';

  const resolvedFront = front ?? children ?? text ?? initialText ?? '';
  const resolvedBack = back ?? revealText ?? resolvedFront;
  const isPrimitiveContent =
    typeof resolvedFront === 'string' || typeof resolvedFront === 'number';
  const resolvedFlipKey = flipKey ?? (isPrimitiveContent ? resolvedFront : undefined);
  const resolvedAriaLabel =
    ariaLabel ?? (isPrimitiveContent ? String(resolvedFront) : undefined);

  const [frontContent, setFrontContent] = React.useState(resolvedFront);
  const [backContent, setBackContent] = React.useState(resolvedBack);
  const lastKeyRef = React.useRef(resolvedFlipKey);
  const [showBackFace, setShowBackFace] = React.useState(() => (
    isControlledFlip ? isFlipped : false
  ));
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isControlledFlip) return;
    if (resolvedFlipKey == null) return;
    if (Object.is(resolvedFlipKey, lastKeyRef.current)) return;

    let isActive = true;
    setBackContent(resolvedFront);
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
        setFrontContent(resolvedFront);
        setBackContent(resolvedFront);
        lastKeyRef.current = resolvedFlipKey;
        controls.set({ rotateX: 0, rotateY: 0 });
      });
    return () => {
      isActive = false;
    };
  }, [
    isControlledFlip,
    resolvedFlipKey,
    resolvedFront,
    axis,
    hoverRotation,
    duration,
    controls,
  ]);

  React.useEffect(() => {
    if (!isControlledFlip) return;
    let isActive = true;
    const target = isFlipped ? hoverRotation : 0;
    setIsAnimating(true);
    controls.stop();
    controls
      .start({
        rotateX: axis === 'X' ? target : 0,
        rotateY: axis === 'Y' ? target : 0,
        transition: { duration, ease: [0.22, 1, 0.36, 1] },
      })
      .then(() => {
        if (!isActive) return;
        setIsAnimating(false);
        setShowBackFace(isFlipped);
      });
    return () => {
      isActive = false;
    };
  }, [isControlledFlip, isFlipped, axis, hoverRotation, duration, controls]);

  const backFaceTransform =
    axis === 'X'
      ? `rotateX(${faceRotation}deg) translateZ(var(--cube-depth))`
      : `rotateY(${faceRotation}deg) translateZ(var(--cube-depth))`;

  const renderFront = isControlledFlip
    ? resolvedFront
    : resolvedFlipKey == null
      ? resolvedFront
      : frontContent;
  const renderBack = isControlledFlip
    ? resolvedBack
    : resolvedFlipKey == null
      ? resolvedBack
      : backContent;
  const initialRotation = isControlledFlip && isFlipped ? hoverRotation : 0;
  const frontFaceStyle = {
    transform: 'translateZ(var(--cube-depth))',
    ...(isControlledFlip
      ? isAnimating
        ? { opacity: 1, pointerEvents: 'none' }
        : { opacity: showBackFace ? 0 : 1, pointerEvents: showBackFace ? 'none' : 'auto' }
      : null),
  };
  const backFaceStyle = {
    transform: backFaceTransform,
    ...(isControlledFlip
      ? isAnimating
        ? { opacity: 1, pointerEvents: 'none' }
        : { opacity: showBackFace ? 1 : 0, pointerEvents: showBackFace ? 'auto' : 'none' }
      : null),
  };

  const rootClassName = [
    'cube-flip',
    className,
    isControlledFlip ? 'is-controlled' : '',
    isControlledFlip && isFlipped ? 'is-flipped' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClassName}
      style={{ '--cube-depth': depth, ...style }}
      aria-label={resolvedAriaLabel}
    >
      <div className="cube-flip__ghost" aria-hidden="true">
        {renderFront}
      </div>
      <div className="cube-flip__ghost" aria-hidden="true">
        {renderBack}
      </div>
      <MotionDiv
        className="cube-flip__cube"
        initial={{
          rotateX: axis === 'X' ? initialRotation : 0,
          rotateY: axis === 'Y' ? initialRotation : 0,
        }}
        animate={controls}
      >
        <div
          className="cube-flip__face cube-flip__face--front"
          aria-hidden="true"
          style={frontFaceStyle}
        >
          {renderFront}
        </div>
        <div
          className="cube-flip__face cube-flip__face--back"
          aria-hidden="true"
          style={backFaceStyle}
        >
          {renderBack}
        </div>
      </MotionDiv>
    </div>
  );
};

export { CubeFlipElement };
export default CubeFlipElement;
