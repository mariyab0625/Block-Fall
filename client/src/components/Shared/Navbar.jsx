import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NeonButton from './NeonButton';
import AnimatedEmoji from './AnimatedEmoji';
import './Navbar.css';

const NAV_SIZE = 34;

/**
 * Navbar
 *
 * Props:
 *   showPause       bool
 *   onPause         fn
 *   isPaused        bool
 *   emojiInNav      bool   – render the emoji slot in logo
 *   emojiRef        ref    – ref attached to the emoji slot so parent can measure it
 *   showEmojiGhost  bool   – hide the real emoji (flying one is in the air)
 *   onEmojiClick    fn
 */
export default function Navbar({
  onPause, isPaused, showPause,
  emojiInNav, emojiRef, showEmojiGhost, onEmojiClick,
}) {
  const { user, logout, isLoggedIn, avatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isGame   = location.pathname === '/game';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <div className="navbar__logo" onClick={() => navigate('/')}>

        {/* Emoji slot — always rendered when emojiInNav so we can measure it */}
        {emojiInNav && (
          <div
            ref={emojiRef}
            style={{
              width:  NAV_SIZE,
              height: NAV_SIZE,
              flexShrink: 0,
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); onEmojiClick?.(); }}
          >
            {/* Hide real emoji while the flying one is mid-air */}
            {!showEmojiGhost && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <AnimatedEmoji
                  size={NAV_SIZE}
                  followCursor={false}
                  bob={false}
                  expression="normal"
                />
              </motion.div>
            )}
          </div>
        )}

        <span className="navbar__logo-text">BLOCK</span>
        <span className="navbar__logo-fall">FALL</span>
      </div>

      {/* ── Centre ── */}
      <div className="navbar__center">
        {showPause && (
          <NeonButton color="yellow" size="sm" onClick={onPause}>
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </NeonButton>
        )}
      </div>

      {/* ── Right ── */}
      <div className="navbar__right">
        {isLoggedIn ? (
          <div className="navbar__profile" ref={dropRef}>
            <button
              className="navbar__profile-btn"
              onClick={() => setDropdownOpen(v => !v)}
            >
              <span className="navbar__avatar">{avatar.emoji}</span>
              <span className="navbar__username">{user.username}</span>
              <span className="navbar__chevron">{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="navbar__dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-avatar">{avatar.emoji}</span>
                    <div>
                      <p className="navbar__dropdown-name">{user.username}</p>
                      <p className="navbar__dropdown-sub">
                        Level {user.maxLevel ?? 1} · {user.highScore?.toLocaleString() ?? '0'} pts
                      </p>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item"
                    onClick={() => { setDropdownOpen(false); logout(); }}
                  >
                    🚪 Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          !isGame && (
            <NeonButton color="cyan" size="sm" onClick={() => navigate('/')}>
              LOGIN
            </NeonButton>
          )
        )}
      </div>
    </nav>
  );
}
