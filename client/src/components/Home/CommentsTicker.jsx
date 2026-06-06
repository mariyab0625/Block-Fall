import React, { useEffect, useRef, useState } from 'react';
import { AVATARS } from '../../context/AuthContext';
import './CommentsTicker.css';

const DUMMY_COMMENTS = [
  { user: 'PHANTOM_X', avatar: '👾', text: 'Level 8 is absolutely brutal 🔥', rating: 5 },
  { user: 'VORTEX',    avatar: '🤖', text: 'Love the neon aesthetics!',         rating: 5 },
  { user: 'NOVA_99',   avatar: '👻', text: 'Finally beat level 5! That column mechanic is wild', rating: 4 },
  { user: 'CIPHER_Z',  avatar: '🥷', text: 'Best puzzle game I have played this year', rating: 5 },
  { user: 'GLITCH',    avatar: '🟦', text: 'The block physics feel really satisfying', rating: 4 },
  { user: 'STARFALL',  avatar: '👾', text: 'Can we get a mobile version? 🙏',    rating: 4 },
  { user: 'NEXUS',     avatar: '🤖', text: 'Score system is super addictive',     rating: 5 },
  { user: 'PIXEL_Q',   avatar: '🥷', text: 'That +10 corner animation is 🔥',    rating: 5 },
  { user: 'ARCANE',    avatar: '👻', text: 'Why does time fly when playing this', rating: 5 },
  { user: 'DRIFT',     avatar: '🟦', text: 'The emoji mascot is so cute omg',     rating: 4 },
  { user: 'SPECTRE',   avatar: '👾', text: 'Hit 50k score today, new PB!',        rating: 5 },
  { user: 'ZERO_X',    avatar: '🤖', text: 'Simple concept but deep gameplay',    rating: 4 },
];

const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function CommentsTicker() {
  // Duplicate list so it loops seamlessly
  const doubled = [...DUMMY_COMMENTS, ...DUMMY_COMMENTS];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-label">💬 PLAYER REVIEWS</div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {doubled.map((c, i) => (
            <div key={i} className="ticker-card">
              <span className="ticker-avatar">{c.avatar}</span>
              <div className="ticker-content">
                <span className="ticker-user">{c.user}</span>
                <span className="ticker-rating">{STARS(c.rating)}</span>
                <span className="ticker-text">"{c.text}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
