import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * AnimatedEmoji — SVG Arya-style pixel block mascot.
 *
 * Expressions: 'normal' | 'happy' | 'excited' | 'thinking' | 'wink' | 'peek'
 *
 * 'peek' = arms slide up and cover eyes, pupils peek over the top edge — used
 *           when the user is typing a password.
 */
export default function AnimatedEmoji({
  size         = 120,
  followCursor = true,
  expression   = 'normal',
  bob          = true,
  style        = {},
}) {
  const wrapRef    = useRef(null);
  const armControl = useAnimation();
  const [ang, setAng] = useState({ L: -0.5, R: -0.5 });

  // ── Cursor tracking ────────────────────────────────────────────────────────
  const onMove = useCallback((e) => {
    if (!wrapRef.current || !followCursor || expression === 'peek') return;
    const r  = wrapRef.current.getBoundingClientRect();
    setAng({
      L: Math.atan2(e.clientY - (r.top + r.height * 0.415), e.clientX - (r.left + r.width * 0.36)),
      R: Math.atan2(e.clientY - (r.top + r.height * 0.415), e.clientX - (r.left + r.width * 0.64)),
    });
  }, [followCursor, expression]);

  useEffect(() => {
    if (!followCursor) return;
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [onMove, followCursor]);

  // ── Arm animation for peek ─────────────────────────────────────────────────
  useEffect(() => {
    if (expression === 'peek') {
      armControl.start('peek');
    } else {
      armControl.start('normal');
    }
  }, [expression, armControl]);

  // ── Layout constants ───────────────────────────────────────────────────────
  const s          = size;
  const BODY_PAD   = s * 0.07;
  const BODY_W     = s - BODY_PAD * 2;
  const BODY_H     = s - BODY_PAD * 2;
  const BODY_R     = s * 0.18;
  const BORDER     = s * 0.055;

  const EYE_W      = s * 0.195;
  const EYE_H      = s * 0.185;
  const EYE_R      = s * 0.04;
  const EYE_Y      = s * 0.385;
  const EL_X       = s * 0.27;
  const ER_X       = s * 0.535;

  const PUP_W      = s * 0.075;
  const PUP_H      = s * 0.09;
  const PUP_R      = s * 0.015;

  const MOUTH_Y    = s * 0.655;
  const MOUTH_W    = s * 0.19;
  const MOUTH_H    = s * 0.048;

  const ARM_W      = s * 0.115;
  const ARM_H      = s * 0.175;
  const ARM_R      = s * 0.03;
  const ARM_Y_BASE = s * 0.46;   // normal arm Y
  // Peek: arms rise to cover the eyes (y = eye centre - arm height)
  const ARM_Y_PEEK = EYE_Y - ARM_H * 0.15;

  const LARM_X     = BODY_PAD - ARM_W + s * 0.005;
  const RARM_X     = BODY_PAD + BODY_W - s * 0.005;
  const HB         = s * 0.042;
  const HG         = s * 0.008;

  // ── Pupil positions ────────────────────────────────────────────────────────
  const MAX = s * 0.048;
  // In peek: pupils drift upward to simulate looking over the arms
  const peekOffset = expression === 'peek' ? -EYE_H * 0.45 : 0;
  const pl = {
    dx: expression === 'peek' ? 0  : Math.cos(ang.L) * MAX,
    dy: expression === 'peek' ? peekOffset : Math.sin(ang.L) * MAX,
  };
  const pr = {
    dx: expression === 'peek' ? 0  : Math.cos(ang.R) * MAX,
    dy: expression === 'peek' ? peekOffset : Math.sin(ang.R) * MAX,
  };

  // ── Expression tweaks ─────────────────────────────────────────────────────
  const isPeek     = expression === 'peek';
  const isWink     = expression === 'wink';
  const isExcited  = expression === 'excited';
  const isThinking = expression === 'thinking';
  const showBlush  = expression === 'happy' || expression === 'excited';

  const browLift = { normal:0, happy:-s*0.025, excited:-s*0.035, thinking:s*0.02, wink:-s*0.015, peek: s*0.01 };
  const bLift    = browLift[expression] || 0;

  const mouthW = { normal: MOUTH_W, happy: MOUTH_W*1.3, excited: MOUTH_W*0.7, thinking: MOUTH_W*0.75, wink: MOUTH_W, peek: MOUTH_W*0.6 };
  const mouthH = { normal: MOUTH_H, happy: MOUTH_H*1.1, excited: MOUTH_H*0.6, thinking: MOUTH_H,     wink: MOUTH_H, peek: MOUTH_H*0.8 };
  const curMW   = mouthW[expression] || MOUTH_W;
  const curMH   = mouthH[expression] || MOUTH_H;
  const curMX   = s / 2 - curMW / 2;

  // Arm animation variants
  const armVariants = {
    normal: (isLeft) => ({
      y: 0,
      transition: { type: 'spring', stiffness: 180, damping: 18 },
    }),
    peek: (isLeft) => ({
      y: ARM_Y_PEEK - ARM_Y_BASE,
      transition: { type: 'spring', stiffness: 200, damping: 16 },
    }),
  };

  // ── Helpers: render arm + hand ─────────────────────────────────────────────
  const renderArm = (isLeft) => {
    const ax = isLeft ? LARM_X : RARM_X;
    return (
      <motion.g
        custom={isLeft}
        variants={armVariants}
        animate={armControl}
        initial="normal"
      >
        {/* Arm body */}
        <rect
          x={ax} y={ARM_Y_BASE}
          width={ARM_W} height={ARM_H}
          rx={ARM_R}
          fill={`url(#bg_${size})`}
          stroke={`url(#border_${size})`}
          strokeWidth={s * 0.025}
          filter={`url(#glow_${size})`}
        />
        {/* Hand pixel blocks */}
        {[0,1].map(col => [0,1].map(row => {
          const hx = isLeft
            ? ax - HB*0.5 + col*(HB+HG)
            : ax + ARM_W - HB*1.5 - HG + col*(HB+HG);
          const hy = ARM_Y_BASE + ARM_H - HB*0.5 + row*(HB+HG);
          const isAccent = isLeft
            ? (col===0 && row===1)
            : (col===1 && row===0);
          return (
            <rect
              key={`${isLeft?'l':'r'}h${col}${row}`}
              x={hx} y={hy}
              width={HB} height={HB}
              rx={s*0.008}
              fill={isAccent ? '#ff40c0' : '#00d4ff'}
              opacity="0.95"
              filter={`url(#eyeglow_${size})`}
            />
          );
        }))}
      </motion.g>
    );
  };

  return (
    <motion.div
      ref={wrapRef}
      animate={bob ? { y: [0, -(s * 0.10), 0] } : {}}
      transition={bob ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } : {}}
      style={{ position: 'relative', width: s, height: s, ...style }}
    >
      <svg
        width={s} height={s}
        viewBox={`0 0 ${s} ${s}`}
        overflow="visible"
      >
        <defs>
          <linearGradient id={`bg_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#5cd8f5" />
            <stop offset="42%"  stopColor="#8a6ff0" />
            <stop offset="100%" stopColor="#f040a0" />
          </linearGradient>
          <linearGradient id={`border_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#ff1aaa" />
          </linearGradient>
          <linearGradient id={`eye_${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#0d1a2e" />
            <stop offset="100%" stopColor="#060810" />
          </linearGradient>
          <radialGradient id={`pup_${size}`} cx="35%" cy="30%" r="60%">
            <stop offset="0%"   stopColor="#80f8ff" />
            <stop offset="60%"  stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0090cc" />
          </radialGradient>
          <radialGradient id={`pupr_${size}`} cx="35%" cy="30%" r="60%">
            <stop offset="0%"   stopColor="#ffaaee" />
            <stop offset="60%"  stopColor="#ff40c0" />
            <stop offset="100%" stopColor="#cc0088" />
          </radialGradient>
          <filter id={`glow_${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={s * 0.045} result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`eyeglow_${size}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={s * 0.025} result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Clip to face — arms that go above the body are hidden */}
          <clipPath id={`faceClip_${size}`}>
            <rect x={BODY_PAD} y={BODY_PAD} width={BODY_W} height={BODY_H} rx={BODY_R} />
          </clipPath>
        </defs>

        {/* ── Glow halo ── */}
        <rect x={BODY_PAD} y={BODY_PAD} width={BODY_W} height={BODY_H}
          rx={BODY_R} fill={`url(#border_${size})`} opacity="0.35"
          filter={`url(#glow_${size})`} />

        {/* ── Neon border ── */}
        <rect x={BODY_PAD} y={BODY_PAD} width={BODY_W} height={BODY_H}
          rx={BODY_R} fill="none"
          stroke={`url(#border_${size})`} strokeWidth={s * 0.04}
          filter={`url(#glow_${size})`} />

        {/* ── Body fill ── */}
        <rect x={BODY_PAD+BORDER} y={BODY_PAD+BORDER}
          width={BODY_W-BORDER*2} height={BODY_H-BORDER*2}
          rx={BODY_R*0.85} fill={`url(#bg_${size})`} />

        {/* ── Top-left shine ── */}
        <rect x={BODY_PAD+BORDER+s*0.02} y={BODY_PAD+BORDER+s*0.02}
          width={BODY_W*0.55} height={BODY_H*0.42}
          rx={BODY_R*0.7} fill="white" opacity="0.09" />

        {/* ── ARMS (animated) ── */}
        {renderArm(true)}
        {renderArm(false)}

        {/* ── Eyebrows ── */}
        <rect x={EL_X + EYE_W*0.1}      y={EYE_Y - s*0.09 + bLift}
          width={EYE_W*0.82} height={s*0.032} rx={s*0.012}
          fill="#0a1a30" opacity="0.85" />
        <rect x={ER_X + EYE_W*0.08}     y={EYE_Y - s*0.09 + bLift}
          width={EYE_W*0.82} height={s*0.032} rx={s*0.012}
          fill="#0a1a30" opacity="0.85" />

        {/* ── Left eye socket ── */}
        <rect x={EL_X} y={EYE_Y} width={EYE_W} height={EYE_H}
          rx={EYE_R} fill={`url(#eye_${size})`} />

        {/* Left pupil */}
        <rect
          x={EL_X + EYE_W/2 - PUP_W/2 + pl.dx}
          y={EYE_Y + EYE_H/2 - PUP_H/2 + pl.dy}
          width={PUP_W} height={PUP_H} rx={PUP_R}
          fill={`url(#pup_${size})`}
          filter={`url(#eyeglow_${size})`}
        />
        <rect
          x={EL_X + EYE_W/2 - PUP_W/2 + pl.dx + PUP_W*0.55}
          y={EYE_Y + EYE_H/2 - PUP_H/2 + pl.dy + PUP_H*0.08}
          width={PUP_W*0.3} height={PUP_H*0.28} rx={s*0.006}
          fill="white" opacity="0.75"
        />

        {/* ── Right eye socket ── */}
        {isWink ? (
          <g>
            <rect x={ER_X} y={EYE_Y} width={EYE_W} height={EYE_H}
              rx={EYE_R} fill={`url(#eye_${size})`} opacity="0.5" />
            <path
              d={`M${ER_X+EYE_W*0.08},${EYE_Y+EYE_H*0.45} Q${ER_X+EYE_W*0.5},${EYE_Y+EYE_H*1.05} ${ER_X+EYE_W*0.92},${EYE_Y+EYE_H*0.45}`}
              fill="none" stroke="#00d4ff" strokeWidth={s*0.032} strokeLinecap="round"
              filter={`url(#eyeglow_${size})`}
            />
          </g>
        ) : (
          <g>
            <rect x={ER_X} y={EYE_Y} width={EYE_W} height={EYE_H}
              rx={EYE_R} fill={`url(#eye_${size})`} />
            <rect
              x={ER_X + EYE_W/2 - PUP_W/2 + pr.dx}
              y={EYE_Y + EYE_H/2 - PUP_H/2 + pr.dy}
              width={PUP_W} height={PUP_H} rx={PUP_R}
              fill={`url(#pupr_${size})`}
              filter={`url(#eyeglow_${size})`}
            />
            <rect
              x={ER_X + EYE_W/2 - PUP_W/2 + pr.dx + PUP_W*0.55}
              y={EYE_Y + EYE_H/2 - PUP_H/2 + pr.dy + PUP_H*0.08}
              width={PUP_W*0.3} height={PUP_H*0.28} rx={s*0.006}
              fill="white" opacity="0.75"
            />
          </g>
        )}

        {/* ── Peek overlay: semi-transparent cover across eye zone ── */}
        {isPeek && (
          <motion.rect
            x={BODY_PAD + BORDER}
            y={EYE_Y - s*0.02}
            width={BODY_W - BORDER*2}
            height={EYE_H + s*0.04}
            rx={s*0.02}
            fill={`url(#bg_${size})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.88 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* ── Blush ── */}
        {showBlush && (
          <>
            <ellipse cx={EL_X - s*0.01} cy={EYE_Y + EYE_H + s*0.065}
              rx={s*0.09} ry={s*0.04} fill="#ff60b0" opacity="0.3" />
            <ellipse cx={ER_X + EYE_W + s*0.01} cy={EYE_Y + EYE_H + s*0.065}
              rx={s*0.09} ry={s*0.04} fill="#ff60b0" opacity="0.3" />
          </>
        )}

        {/* ── Thinking dots ── */}
        {isThinking && (
          <>
            <circle cx={ER_X+EYE_W+s*0.06} cy={EYE_Y-s*0.04} r={s*0.022} fill="#00f5ff" opacity="0.8" />
            <circle cx={ER_X+EYE_W+s*0.11} cy={EYE_Y-s*0.09} r={s*0.016} fill="#00f5ff" opacity="0.55" />
            <circle cx={ER_X+EYE_W+s*0.15} cy={EYE_Y-s*0.14} r={s*0.011} fill="#00f5ff" opacity="0.35" />
          </>
        )}

        {/* ── Mouth ── */}
        {isExcited ? (
          <ellipse cx={s/2} cy={MOUTH_Y+s*0.015}
            rx={s*0.075} ry={s*0.055}
            fill="#050510" stroke="#ff40c0" strokeWidth={s*0.022}
            filter={`url(#eyeglow_${size})`} />
        ) : (
          <rect x={curMX} y={MOUTH_Y}
            width={curMW} height={curMH} rx={s*0.018}
            fill="#050510" opacity="0.88" />
        )}

        {/* ── Corner pixel accents ── */}
        <rect x={BODY_PAD}                      y={BODY_PAD}                      width={s*0.042} height={s*0.042} fill="#00f5ff" opacity="0.7" />
        <rect x={BODY_PAD+BODY_W-s*0.042}       y={BODY_PAD}                      width={s*0.042} height={s*0.042} fill="#ff1aaa" opacity="0.7" />
        <rect x={BODY_PAD}                      y={BODY_PAD+BODY_H-s*0.042}       width={s*0.042} height={s*0.042} fill="#ff1aaa" opacity="0.7" />
        <rect x={BODY_PAD+BODY_W-s*0.042}       y={BODY_PAD+BODY_H-s*0.042}      width={s*0.042} height={s*0.042} fill="#00f5ff" opacity="0.7" />
      </svg>
    </motion.div>
  );
}
