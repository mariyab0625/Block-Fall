import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FadeSection from '../Shared/FadeSection';
import Logo from '../Shared/Logo';
import CommentsTicker from './CommentsTicker';
import './BelowFold.css';

/* ── Star rating ── */
function StarRating({ value, onChange, readOnly }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`star-rating__star ${n <= display ? 'star-rating__star--on' : ''}`}
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: '⬇️', title: 'Falling Physics',    desc: 'Classic Tetromino blocks spawn at the top and fall with real gravity. Control placement before they lock.' },
  { icon: '💥', title: 'Row Clear Mechanic', desc: 'Fill a complete horizontal row and watch it shatter with a neon flash, awarding +10 points per line.' },
  { icon: '⚠️', title: 'Column Danger',      desc: 'Let a vertical column fill to the top and the game ends. Stack smart — every move counts.' },
  { icon: '⬆️', title: '10 Levels',          desc: 'Start at 9×9. Each level scales the grid, increases speed, and challenges your spatial thinking.' },
  { icon: '🔄', title: 'Space to Rotate',    desc: 'Press Space up to 4 times to cycle through all rotations. Find the perfect orientation before dropping.' },
  { icon: '🏆', title: 'Leaderboard',        desc: 'Compete globally. Your high score is saved and displayed on the live leaderboard for all players.' },
];

const SPONSORS = [
  { name: 'NeonTech',   color: '#00f5ff', icon: '⚡' },
  { name: 'PixelForge', color: '#bf5fff', icon: '🎮' },
  { name: 'CyberLabs',  color: '#39ff14', icon: '🔬' },
  { name: 'ArcadeCore', color: '#f5e642', icon: '🕹️' },
  { name: 'GridWork',   color: '#ff8800', icon: '📐' },
];

export default function BelowFold({ onRatingSubmit, globalRating }) {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [rated,      setRated]      = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  const handleRate = () => {
    if (userRating > 0 && !rated) {
      onRatingSubmit?.(userRating);
      setRated(true);
    }
  };

  return (
    <div className="below-fold">

      {/* ── About ── */}
      <FadeSection>
        <section className="bf-section bf-about">
          <div className="bf-section__header">
            <span className="bf-section__tag">ABOUT THE GAME</span>
            <h2 className="bf-section__title">
              What is <Logo size="sm" style={{ verticalAlign: 'middle' }} />?
            </h2>
          </div>
          <p className="bf-about__lead">
            BLOCKFALL is a neon-drenched arcade puzzle game inspired by classic Tetris — rebuilt for the browser with modern physics, dynamic difficulty scaling, and a competitive leaderboard.
          </p>
          <p className="bf-about__body">
            Stack falling Tetrominoes strategically to clear horizontal rows before the columns fill up. Each level grows the grid and increases the falling speed, pushing your reflexes and spatial reasoning to the limit. With 10 challenging levels, a global high-score board, and smooth neon animations throughout, BLOCKFALL is designed to be easy to pick up but genuinely difficult to master.
          </p>
          <div className="bf-about__stats">
            <div className="bf-stat"><span className="bf-stat__num">10</span><span className="bf-stat__label">Levels</span></div>
            <div className="bf-stat"><span className="bf-stat__num">7</span><span className="bf-stat__label">Block Types</span></div>
            <div className="bf-stat"><span className="bf-stat__num">∞</span><span className="bf-stat__label">Replayability</span></div>
            <div className="bf-stat"><span className="bf-stat__num">🌍</span><span className="bf-stat__label">Global Scores</span></div>
          </div>
        </section>
      </FadeSection>

      {/* ── Features ── */}
      <FadeSection delay={0.1}>
        <section className="bf-section bf-features">
          <span className="bf-section__tag">FEATURES</span>
          <h2 className="bf-section__title">Everything you need to get hooked</h2>
          <div className="bf-features__grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="bf-feature-card"
                whileHover={{ scale: 1.03, borderColor: '#00f5ff' }}
                transition={{ duration: 0.2 }}
              >
                <span className="bf-feature-card__icon">{f.icon}</span>
                <h3 className="bf-feature-card__title">{f.title}</h3>
                <p className="bf-feature-card__desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Rating ── */}
      <FadeSection delay={0.1}>
        <section className="bf-section bf-rating">
          <span className="bf-section__tag">RATE THE GAME</span>
          <h2 className="bf-section__title">Enjoying BLOCKFALL?</h2>
          <p className="bf-rating__sub">Your rating helps us improve and reach more players.</p>
          <div className="bf-rating__row">
            <StarRating value={userRating} onChange={setUserRating} readOnly={rated} />
            {!rated ? (
              <button
                className="bf-rating__submit"
                onClick={handleRate}
                disabled={userRating === 0}
              >
                Submit Rating
              </button>
            ) : (
              <span className="bf-rating__thanks">Thanks for rating! ⭐</span>
            )}
          </div>
          {globalRating > 0 && (
            <p className="bf-rating__global">
              Global average: <strong>{globalRating.toFixed(1)}</strong> / 5
            </p>
          )}
        </section>
      </FadeSection>

      {/* ── Comments ticker ── */}
      <FadeSection delay={0.05}>
        <CommentsTicker />
      </FadeSection>

      {/* ── Sponsors ── */}
      <FadeSection delay={0.1}>
        <section className="bf-section bf-sponsors">
          <span className="bf-section__tag">SUPPORTED BY</span>
          <div className="bf-sponsors__row">
            {SPONSORS.map((s, i) => (
              <motion.div
                key={i}
                className="bf-sponsor"
                style={{ borderColor: s.color + '44' }}
                whileHover={{ borderColor: s.color, boxShadow: `0 0 16px ${s.color}44` }}
              >
                <span className="bf-sponsor__icon">{s.icon}</span>
                <span className="bf-sponsor__name" style={{ color: s.color }}>{s.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Subscribe ── */}
      <FadeSection delay={0.1}>
        <section className="bf-section bf-subscribe">
          <div className="bf-subscribe__box">
            <span className="bf-section__tag">STAY IN THE LOOP</span>
            <h2 className="bf-subscribe__title">Get notified on updates</h2>
            <p className="bf-subscribe__desc">
              New levels, features, and tournaments are coming.<br />
              Subscribe to be the first to know — no spam, ever.<br />
              Drop your email and join the BLOCKFALL community.
            </p>
            {subscribed ? (
              <p className="bf-subscribe__success">✅ You're on the list! See you in the game.</p>
            ) : (
              <form className="bf-subscribe__form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bf-subscribe__input"
                  required
                />
                <button type="submit" className="bf-subscribe__btn">SUBSCRIBE</button>
              </form>
            )}
          </div>
        </section>
      </FadeSection>

      {/* ── Footer ── */}
      <footer className="bf-footer">
        <div className="bf-footer__inner">
          <div className="bf-footer__brand">
            <Logo size="sm" />
            <p className="bf-footer__tagline">Stack. Clear. Conquer.</p>
          </div>
          <div className="bf-footer__links">
            <span className="bf-footer__link">Privacy Policy</span>
            <span className="bf-footer__dot">·</span>
            <span className="bf-footer__link">Terms of Use</span>
            <span className="bf-footer__dot">·</span>
            <span className="bf-footer__link">Contact</span>
          </div>
          <p className="bf-footer__copy">© 2026 BLOCKFALL. Built with ❤️ and neon.</p>
        </div>
      </footer>
    </div>
  );
}
