import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LEVEL_CONFIG } from '../../utils/levelConfig';
import NeonButton from '../Shared/NeonButton';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import ProgressBar from '../Shared/ProgressBar';
import Modal from '../Shared/Modal';
import './LevelSelector.css';

const DIFFICULTY_COLORS = {
  'Beginner':  '#39ff14',
  'Easy':      '#39ff14',
  'Easy+':     '#f5e642',
  'Medium':    '#f5e642',
  'Medium+':   '#ff8800',
  'Hard':      '#ff8800',
  'Hard+':     '#ff4d4d',
  'Expert':    '#ff4d4d',
  'Master':    '#ff00aa',
  '⚡ INSANE': '#ff00aa',
};

export default function LevelSelector({ onStart, onClose }) {
  const { selectedLevel, setSelectedLevel } = useGame();
  const [hovered, setHovered] = useState(null);
  const displayLevel = hovered ?? selectedLevel;
  const cfg = LEVEL_CONFIG[displayLevel];

  const difficultyPct = (displayLevel / 10) * 100;
  const diffColor = DIFFICULTY_COLORS[cfg.label] || '#00f5ff';

  const levelExpression = displayLevel <= 2 ? 'happy'
    : displayLevel <= 4 ? 'normal'
    : displayLevel <= 6 ? 'thinking'
    : displayLevel <= 8 ? 'wink'
    : 'excited';

  return (
    <Modal onClose={onClose} className="level-selector">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <AnimatedEmoji
          size={80}
          expression={levelExpression}
          followCursor={true}
          bob={true}
        />
      </div>

      <h2 className="level-selector__title">⚡ SELECT STARTING LEVEL ⚡</h2>
      <div className="level-selector__divider" />

      {/* Level buttons */}
      <div className="level-selector__grid">
        {Object.keys(LEVEL_CONFIG).map(lvl => {
          const n = Number(lvl);
          return (
            <button
              key={n}
              className={`level-btn ${n === selectedLevel ? 'level-btn--active' : ''}`}
              onClick={() => setSelectedLevel(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Level info card */}
      <div className="level-info" style={{ borderColor: diffColor }}>
        <div className="level-info__header" style={{ color: diffColor }}>
          LEVEL {displayLevel}
        </div>
        <div className="level-info__row">
          <span>Grid Size</span>
          <span>{cfg.cols} × {cfg.rows}</span>
        </div>
        <div className="level-info__row">
          <span>Fall Speed</span>
          <span>{(cfg.fallMs / 1000).toFixed(2)}s per row</span>
        </div>
        <div className="level-info__row">
          <span>Block Types</span>
          <span>{cfg.blockTypes === 'ALL' ? 'All 7 types' : cfg.blockTypes.join(', ')}</span>
        </div>
        <div className="level-info__row">
          <span>Difficulty</span>
          <span style={{ color: diffColor }}>{cfg.label}</span>
        </div>

        <ProgressBar pct={difficultyPct} color={diffColor} style={{ marginTop: 12 }} />
      </div>

      <p className="level-selector__note">
        ⚠ Higher levels unlock more block types and faster fall speeds.
      </p>

      <NeonButton color="cyan" size="lg" onClick={onStart} style={{ width: '100%', marginTop: 8 }}>
        ENTER THE GRID
      </NeonButton>
    </Modal>
  );
}
