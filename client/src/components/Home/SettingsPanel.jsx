import React from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth, AVATARS } from '../../context/AuthContext';
import NeonButton from '../Shared/NeonButton';
import Modal from '../Shared/Modal';
import './SettingsPanel.css';

export default function SettingsPanel({ onClose }) {
  const { soundEnabled, setSoundEnabled, volume, setVolume } = useGame();
  const { isLoggedIn, avatarId, changeAvatar } = useAuth();

  return (
    <Modal onClose={onClose} className="settings-panel">
      <h2 className="settings__title">⚙️ SETTINGS</h2>
      <div className="settings__divider" />

      {/* Avatar */}
      <div className="settings__row settings__row--col">
        <span className="settings__label">Profile Picture</span>
        <div className="settings__avatars">
          {AVATARS.map(av => (
            <button
              key={av.id}
              className={`settings__avatar-btn ${avatarId === av.id ? 'settings__avatar-btn--active' : ''}`}
              onClick={() => changeAvatar(av.id)}
              title={av.label}
            >
              <span className="settings__avatar-emoji">{av.emoji}</span>
              <span className="settings__avatar-label">{av.label}</span>
            </button>
          ))}
        </div>
        {!isLoggedIn && (
          <p className="settings__note">Log in to save your avatar across sessions.</p>
        )}
      </div>

      {/* Sound toggle */}
      <div className="settings__row">
        <span className="settings__label">Sound Effects</span>
        <button
          className={`settings__toggle ${soundEnabled ? 'settings__toggle--on' : ''}`}
          onClick={() => setSoundEnabled(v => !v)}
        >
          {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Volume slider */}
      <div className="settings__row">
        <span className="settings__label">Volume</span>
        <input
          type="range" min="0" max="1" step="0.05"
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="settings__slider"
          disabled={!soundEnabled}
        />
        <span className="settings__vol-val">{Math.round(volume * 100)}%</span>
      </div>

      {/* Controls reference */}
      <div className="settings__row">
        <span className="settings__label">Controls</span>
        <div className="settings__controls-grid">
          <span>← →</span><span>Move</span>
          <span>Space</span><span>Rotate (×4)</span>
          <span>↓</span><span>Hard Drop</span>
          <span>P</span><span>Pause</span>
          <span>R</span><span>Restart</span>
        </div>
      </div>

      <NeonButton color="cyan" size="md" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
        SAVE & CLOSE
      </NeonButton>
    </Modal>
  );
}
