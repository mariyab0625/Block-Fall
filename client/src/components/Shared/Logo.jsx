import React from 'react';

/**
 * Logo — "BLOCK FALL" neon wordmark used in Navbar, GamePage, LoadingScreen, BelowFold.
 *
 * Props:
 *   size        'sm' | 'md' | 'lg'   defaults to 'md'
 *   onClick     fn                   optional click handler
 *   style       object               extra inline styles on the wrapper
 */
const SIZE_MAP = {
  sm: '0.9rem',
  md: '1.1rem',
  lg: '1.6rem',
};

export default function Logo({ size = 'md', onClick, style }) {
  const fontSize = SIZE_MAP[size] ?? SIZE_MAP.md;
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize,
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <span style={{ color: '#00f5ff', textShadow: '0 0 10px #00f5ff' }}>BLOCK</span>
      <span style={{ color: '#ff00aa', textShadow: '0 0 10px #ff00aa' }}>FALL</span>
    </span>
  );
}
