import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import Logo from '../Shared/Logo';

// Each caption has its own expression for the emoji
const STEPS = [
  { caption: 'Warming up the grid...',     expression: 'normal'   },
  { caption: 'Shuffling Tetrominoes...',   expression: 'thinking' },
  { caption: 'Charging neon reactors...',  expression: 'excited'  },
  { caption: 'Locking in your blocks...',  expression: 'wink'     },
  { caption: 'Get ready to fall!',         expression: 'happy'    },
];

const CAPTION_MS = 700;                       // ms per caption
const TOTAL_MS   = STEPS.length * CAPTION_MS; // ~3.5s total

export default function LoadingScreen({ onDone }) {
  const [stepIdx,   setStepIdx]   = useState(0);
  const [progress,  setProgress]  = useState(0);

  // Advance step every CAPTION_MS
  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx(i => (i >= STEPS.length - 1 ? i : i + 1));
    }, CAPTION_MS);
    return () => clearInterval(id);
  }, []);

  // Smooth progress + trigger onDone at end
  const stableDone = useCallback(onDone, []); // eslint-disable-line
  useEffect(() => {
    const start = Date.now();
    let raf;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / TOTAL_MS) * 100, 100);
      setProgress(pct);
      if (elapsed < TOTAL_MS) { raf = requestAnimationFrame(tick); }
      else { stableDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stableDone]);

  const currentStep = STEPS[stepIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20,
      }}
    >
      {/* Animated emoji — bobs up/down, expression changes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.expression}
          initial={{ scale: 0.88, opacity: 0.5 }}
          animate={{ scale: 1,    opacity: 1   }}
          exit={{    scale: 0.88, opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedEmoji
            size={160}
            expression={currentStep.expression}
            bob={true}
            followCursor={false}   // no cursor tracking during load
          />
        </motion.div>
      </AnimatePresence>

      {/* BLOCKFALL title */}
      <Logo size="lg" />

      {/* Caption with crossfade */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stepIdx}
          initial={{ opacity: 0, y: 10  }}
          animate={{ opacity: 1, y: 0   }}
          exit={{    opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.04em',
            minHeight: 30,
            textAlign: 'center',
          }}
        >
          {currentStep.caption}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{
        width: 300,
        height: 8,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 99,
        overflow: 'hidden',
        border: '1px solid rgba(0,245,255,0.18)',
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.12, ease: 'linear' }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, #00f5ff, #bf5fff, #ff00aa)',
            boxShadow: '0 0 14px #00f5ff',
          }}
        />
      </div>

      {/* Percent */}
      <p style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.55rem',
        color: 'rgba(255,255,255,0.22)',
        letterSpacing: '0.18em',
      }}>
        {Math.round(progress)}%
      </p>
    </motion.div>
  );
}
