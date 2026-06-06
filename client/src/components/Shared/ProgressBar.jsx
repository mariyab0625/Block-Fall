import React from 'react';

/**
 * ProgressBar — neon-filled horizontal progress bar.
 *
 * Props:
 *   pct       number   0–100
 *   color     string   CSS color for the fill + glow (default neon-green)
 *   height    number   bar height in px (default 8)
 *   style     object   extra wrapper styles
 */
export default function ProgressBar({
  pct = 0,
  color = '#39ff14',
  height = 8,
  style = {},
}) {
  return (
    <div
      style={{
        height,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 99,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${Math.min(Math.max(pct, 0), 100)}%`,
          height: '100%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}
