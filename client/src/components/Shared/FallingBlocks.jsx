import React from 'react';

/**
 * FallingBlocks — animated background tetromino shapes.
 * Extracted from HomePage so it can be reused on any page.
 */
const BLOCKS = [
  { shape: '██\n██',   color: '#f5e642', left: '5%',  delay: '0s',  dur: '12s' },
  { shape: '████',     color: '#00f5ff', left: '15%', delay: '2s',  dur: '9s'  },
  { shape: '░█░\n███', color: '#bf5fff', left: '30%', delay: '4s',  dur: '14s' },
  { shape: '██\n░██',  color: '#39ff14', left: '50%', delay: '1s',  dur: '11s' },
  { shape: '█░\n██',   color: '#ff8800', left: '65%', delay: '6s',  dur: '10s' },
  { shape: '██\n██░',  color: '#ff4d4d', left: '80%', delay: '3s',  dur: '13s' },
  { shape: '████',     color: '#ff00aa', left: '90%', delay: '7s',  dur: '8s'  },
];

export default function FallingBlocks() {
  return (
    <div className="falling-blocks" aria-hidden="true">
      {BLOCKS.map((b, i) => (
        <pre
          key={i}
          className="falling-block"
          style={{
            color: b.color,
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        >
          {b.shape}
        </pre>
      ))}
    </div>
  );
}
