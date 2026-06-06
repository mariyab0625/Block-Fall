import React from 'react';
import '../../styles/neon-theme.css';

export default function NeonButton({ children, color = 'cyan', size = 'md', onClick, disabled, style, className = '' }) {
  return (
    <button
      className={`neon-btn ${color} ${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
