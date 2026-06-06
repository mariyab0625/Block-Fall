import React from 'react';
import NeonButton from '../Shared/NeonButton';
import Modal from '../Shared/Modal';
import './HowToPlay.css';

const STEPS = [
  {
    icon: '🎮',
    title: 'Pick a Level',
    desc: 'Choose your starting level from 1 to 10. Level 1 starts on a 9×9 grid — small and manageable. Higher levels grow the grid and speed up the fall.',
  },
  {
    icon: '⬇️',
    title: 'Blocks Fall From the Top',
    desc: 'Tetromino pieces spawn at the top-centre and fall downward. Use the arrow keys to move and Space to rotate before they land.',
  },
  {
    icon: '✅',
    title: 'Fill Rows or Columns',
    desc: 'When any horizontal row is completely filled with blocks, it clears with a flash, awards points, and frees up space.',
  },
  {
    icon: '🏆',
    title: 'Win the Level',
    desc: 'Each level has a line goal (shown in the score panel). Clear enough lines to conquer the level and advance to a bigger grid.',
  },
  {
    icon: '💀',
    title: 'Avoid Full Columns',
    desc: "If any vertical column fills up completely, it's Game Over. Hard-drop pieces to place them fast and keep columns clear.",
  },
];

const CONTROLS = [
  ['← →',   'Move piece left / right'],
  ['Space', 'Rotate piece clockwise'],
  ['↓',     'Hard drop (instant land)'],
  ['P',     'Pause / Resume'],
  ['R',     'Restart current level'],
];

export default function HowToPlay({ onClose }) {
  return (
    <Modal onClose={onClose} className="htp-modal">
      <h2 className="htp__title">📖 HOW TO PLAY</h2>
      <div className="htp__divider" />

      <div className="htp__steps">
        {STEPS.map((s, i) => (
          <div key={i} className="htp__step">
            <div className="htp__step-icon">{s.icon}</div>
            <div className="htp__step-body">
              <p className="htp__step-title">{s.title}</p>
              <p className="htp__step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="htp__divider" style={{ margin: '20px 0' }} />

      <p className="htp__section-label">KEYBOARD CONTROLS</p>
      <div className="htp__controls">
        {CONTROLS.map(([key, desc]) => (
          <div key={key} className="htp__control-row">
            <span className="htp__key">{key}</span>
            <span className="htp__key-desc">{desc}</span>
          </div>
        ))}
      </div>

      <NeonButton color="cyan" size="md" onClick={onClose} style={{ width: '100%', marginTop: 20 }}>
        GOT IT — LET'S PLAY
      </NeonButton>
    </Modal>
  );
}
