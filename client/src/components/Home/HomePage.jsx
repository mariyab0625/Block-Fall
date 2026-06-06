import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import NeonButton from '../Shared/NeonButton';
import GlowCard from '../Shared/GlowCard';
import AnimatedEmoji from '../Shared/AnimatedEmoji';
import FallingBlocks from '../Shared/FallingBlocks';
import Navbar from '../Shared/Navbar';
import LevelSelector from './LevelSelector';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import Leaderboard from './Leaderboard';
import SettingsPanel from './SettingsPanel';
import HowToPlay from './HowToPlay';
import LoadingScreen from './LoadingScreen';
import BelowFold from './BelowFold';
import './HomePage.css';

const HERO_SIZE = 90;
const NAV_SIZE  = 34;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showLogin,         setShowLogin]         = useState(false);
  const [showRegister,      setShowRegister]      = useState(false);
  const [showSettings,      setShowSettings]      = useState(false);
  const [showHowToPlay,     setShowHowToPlay]     = useState(false);
  const [showLoading,       setShowLoading]       = useState(false);
  const [loaded,            setLoaded]            = useState(false);
  const [showBackTop,       setShowBackTop]       = useState(false);
  const [ratings,           setRatings]           = useState([]);

  const [scrolled, setScrolled] = useState(false);
  const [flying,   setFlying]   = useState(false);
  const [emojiPos, setEmojiPos] = useState(null);

  const heroEmojiRef = useRef(null);
  const navEmojiRef  = useRef(null);
  const heroRef      = useRef(null);

  const globalRating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll → fly emoji between hero and navbar ──
  const prevScrolledRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 300;
      const nowScrolled = heroBottom < 60;
      setShowBackTop(window.scrollY > window.innerHeight * 0.5);

      if (nowScrolled === prevScrolledRef.current) return;
      prevScrolledRef.current = nowScrolled;

      if (nowScrolled) {
        setScrolled(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { flyEmoji('to-nav', () => {}); });
        });
      } else {
        flyEmoji('to-hero', () => setScrolled(false));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []); // eslint-disable-line

  const flyEmoji = (direction, onComplete) => {
    const fromEl = direction === 'to-nav'  ? heroEmojiRef.current : navEmojiRef.current;
    const toEl   = direction === 'to-nav'  ? navEmojiRef.current  : heroEmojiRef.current;
    if (!fromEl || !toEl) { onComplete(); return; }

    const fromRect = fromEl.getBoundingClientRect();
    const toRect   = toEl.getBoundingClientRect();
    const fromSize = direction === 'to-nav' ? HERO_SIZE : NAV_SIZE;
    const toSize   = direction === 'to-nav' ? NAV_SIZE  : HERO_SIZE;

    setEmojiPos({
      fromX: fromRect.left + fromRect.width  / 2 - fromSize / 2,
      fromY: fromRect.top  + fromRect.height / 2 - fromSize / 2,
      toX:   toRect.left   + toRect.width    / 2 - toSize   / 2,
      toY:   toRect.top    + toRect.height   / 2 - toSize   / 2,
      fromSize, toSize, direction, onComplete,
    });
    setFlying(true);
  };

  const handleFlyComplete = () => {
    setFlying(false);
    emojiPos?.onComplete?.();
    setEmojiPos(null);
  };

  const handleBackToTop   = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);
  const handlePlay        = () => setShowLoading(true);
  const handleLoadingDone = () => { setShowLoading(false); setShowLevelSelector(true); };
  const handleStartGame   = () => { setShowLevelSelector(false); navigate('/game'); };

  return (
    <div
      className={`home-page scanlines ${loaded ? 'home-page--loaded' : ''}`}
      style={{ minHeight: '100vh' }}
    >
      {/* ── Sticky navbar (appears after scroll) ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="navbar"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: -70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ position: 'sticky', top: 0, zIndex: 100 }}
          >
            <Navbar
              emojiInNav={true}
              emojiRef={navEmojiRef}
              onEmojiClick={handleBackToTop}
              showEmojiGhost={flying && emojiPos?.direction === 'to-nav'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="home-bg-grid" />
      <FallingBlocks />

      <div className="home-content">
        {/* ── Hero ── */}
        <section className="hero" ref={heroRef}>
          <div className="hero__title-row">
            {/* Placeholder keeps its space so we can measure the position */}
            <div
              ref={heroEmojiRef}
              style={{ width: HERO_SIZE, height: HERO_SIZE, flexShrink: 0, position: 'relative' }}
            >
              {!scrolled && !(flying && emojiPos?.direction === 'to-nav') && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <AnimatedEmoji size={HERO_SIZE} expression="happy" followCursor={true} bob={true} />
                </motion.div>
              )}
            </div>

            <h1 className="hero__title neon-pulse">
              <span className="hero__block">BLOCK</span>
              <span className="hero__fall">FALL</span>
            </h1>
          </div>

          <p className="hero__tagline">
            {'ARCADE PUZZLE GAME'.split('').map((ch, i) => (
              <span key={i} className="hero__char" style={{ animationDelay: `${i * 0.05}s` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </p>
          <p className="hero__coin blink">[ SIGN IN TO SAVE PROGRESS ]</p>
        </section>

        {/* ── 3-column action layout ── */}
        <section className="home-actions">
          <div className="home-col home-col--left">
            <GlowCard className="action-card">
              <h2 className="action-card__title">🎮 PLAY</h2>
              <NeonButton color="cyan" size="lg" onClick={handlePlay} style={{ width: '100%' }}>
                ▶ START GAME
              </NeonButton>
              {isLoggedIn && user?.savedGame && (
                <NeonButton color="green" size="md" onClick={handlePlay} style={{ width: '100%', marginTop: 10 }}>
                  ↩ CONTINUE GAME
                </NeonButton>
              )}
            </GlowCard>

            <GlowCard className="action-card">
              <h2 className="action-card__title">👤 ACCOUNT</h2>
              {isLoggedIn ? (
                <div className="profile-badge">
                  <div className="profile-badge__row">
                    <span>👾</span>
                    <span className="profile-badge__name">{user.username}</span>
                  </div>
                  <div className="profile-badge__stat">🏆 High Score: <strong>{user.highScore?.toLocaleString() ?? '---'}</strong></div>
                  <div className="profile-badge__stat">⭐ Max Level: <strong>{user.maxLevel ?? 1}</strong></div>
                  <div className="profile-badge__stat">🎯 Games: <strong>{user.totalGames ?? 0}</strong></div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <NeonButton color="cyan"   size="md" onClick={() => setShowLogin(true)}    style={{ width: '100%' }}>LOG IN</NeonButton>
                  <NeonButton color="purple" size="md" onClick={() => setShowRegister(true)} style={{ width: '100%', marginTop: 8 }}>REGISTER</NeonButton>
                  <p className="guest-note">or continue as Guest<br /><small>(progress won't be saved)</small></p>
                </div>
              )}
            </GlowCard>
          </div>

          <div className="home-col home-col--centre">
            <Leaderboard />
          </div>

          <div className="home-col home-col--right">
            <GlowCard className="action-card">
              <h2 className="action-card__title">⚙️ SETTINGS</h2>
              <p className="action-card__desc">Avatar, sound, volume and key bindings.</p>
              <NeonButton color="yellow" size="md" onClick={() => setShowSettings(true)} style={{ width: '100%' }}>CONFIGURE</NeonButton>
            </GlowCard>
            <GlowCard className="action-card">
              <h2 className="action-card__title">📖 HOW TO PLAY</h2>
              <p className="action-card__desc">New to Blockfall? Learn the rules.</p>
              <NeonButton color="purple" size="md" onClick={() => setShowHowToPlay(true)} style={{ width: '100%' }}>VIEW GUIDE</NeonButton>
            </GlowCard>
          </div>
        </section>
      </div>

      <BelowFold
        onRatingSubmit={(r) => setRatings(prev => [...prev, r])}
        globalRating={globalRating}
      />

      {/* ── Flying emoji — fixed overlay during scroll transition ── */}
      <AnimatePresence>
        {flying && emojiPos && (
          <motion.div
            key="flying-emoji"
            initial={{
              x: emojiPos.fromX, y: emojiPos.fromY,
              width: emojiPos.fromSize, height: emojiPos.fromSize,
              scale: 1, rotate: 0,
            }}
            animate={{
              x: emojiPos.toX, y: emojiPos.toY,
              width: emojiPos.toSize, height: emojiPos.toSize,
              scale: 1,
              rotate: emojiPos.direction === 'to-nav' ? [0, 15, -10, 0] : [0, -15, 10, 0],
            }}
            transition={{
              duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94],
              rotate: { duration: 0.55, ease: 'easeInOut' },
              width: { duration: 0.55 }, height: { duration: 0.55 },
            }}
            onAnimationComplete={handleFlyComplete}
            style={{
              position: 'fixed', top: 0, left: 0,
              zIndex: 9999, pointerEvents: 'none',
              originX: '50%', originY: '50%',
            }}
          >
            <AnimatedEmoji
              size={emojiPos.fromSize}
              expression={emojiPos.direction === 'to-nav' ? 'excited' : 'happy'}
              followCursor={false}
              bob={false}
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back to top ── */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            className="back-to-top"
            onClick={handleBackToTop}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.6, y: 20  }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoading && <LoadingScreen onDone={handleLoadingDone} />}
      </AnimatePresence>

      {showLevelSelector && <LevelSelector onStart={handleStartGame} onClose={() => setShowLevelSelector(false)} />}
      {showLogin    && <LoginModal    onClose={() => setShowLogin(false)}    onSwitchToRegister={() => { setShowLogin(false);    setShowRegister(true); }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() =>    { setShowRegister(false); setShowLogin(true);    }} />}
      {showSettings  && <SettingsPanel onClose={() => setShowSettings(false)}  />}
      {showHowToPlay && <HowToPlay     onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
