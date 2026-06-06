import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatDisplay — a labelled numeric/text value with neon glow.
 * Consolidates StatRow (GamePage ScoreCard), OverlayStat (WinOverlay/GameOverOverlay),
 * and StatBlock (ScorePanel).
 *
 * Props:
 *   label       string   — ALL-CAPS label text
 *   value       any      — value to display
 *   color       string   — neon color for the value
 *   animate     bool     — spring-scale when value changes (default true)
 *   layout      'row' | 'col'   — 'row' stacks label-above-value (default), 'col' is side-by-side
 *   divider     bool     — show a bottom border/divider (default false)
 *   valueSize   string   — font-size for value (default '1.1rem')
 *   labelSize   string   — font-size for label (default '0.5rem')
 */
export default function StatDisplay({
  label,
  value,
  color = '#00f5ff',
  animate = true,
  layout = 'col',
  divider = false,
  valueSize = '1.1rem',
  labelSize = '0.5rem',
}) {
  const ValueEl = animate ? motion.p : 'p';
  const animProps = animate
    ? {
        key: String(value),
        initial: { scale: 1.35 },
        animate: { scale: 1 },
        transition: { duration: 0.25, type: 'spring' },
      }
    : {};

  const isCol = layout === 'col';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isCol ? 'column' : 'row',
        alignItems: isCol ? undefined : 'center',
        gap: isCol ? undefined : 8,
        paddingBottom: divider ? 10 : 0,
        marginBottom: divider ? 10 : 0,
        borderBottom: divider ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <p
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: labelSize,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.12em',
          marginBottom: isCol ? 4 : 0,
          flexShrink: 0,
        }}
      >
        {label}
      </p>
      <ValueEl
        {...animProps}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: valueSize,
          color,
          textShadow: `0 0 10px ${color}`,
          marginTop: 0,
        }}
      >
        {value}
      </ValueEl>
    </div>
  );
}
