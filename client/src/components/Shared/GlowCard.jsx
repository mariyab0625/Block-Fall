import React from 'react';
import '../../styles/neon-theme.css';

export default function GlowCard({ children, style, className = '' }) {
  return (
    <div className={`glow-card ${className}`} style={style}>
      {children}
    </div>
  );
}
