import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../../utils/api';
import GlowCard from '../Shared/GlowCard';
import { useAuth } from '../../context/AuthContext';
import './Leaderboard.css';

const RANK_COLORS = ['#f5e642', '#c0c0c0', '#cd7f32'];
const RANK_ICONS  = ['🥇', '🥈', '🥉'];

// Dummy data shown when backend isn't connected
const DUMMY = [
  { rank: 1, username: 'PHANTOM_X', score: 99990, levelReached: 10 },
  { rank: 2, username: 'VORTEX',    score: 84200, levelReached: 9  },
  { rank: 3, username: 'NOVA',      score: 78100, levelReached: 8  },
  { rank: 4, username: 'CIPHER',    score: 65400, levelReached: 7  },
  { rank: 5, username: 'GLITCH',    score: 52300, levelReached: 7  },
];

export default function Leaderboard() {
  const { user, isLoggedIn } = useAuth();
  const [entries, setEntries] = useState(DUMMY);

  useEffect(() => {
    getLeaderboard()
      .then(res => {
        // Guard: only update if the response is actually an array
        if (Array.isArray(res.data)) setEntries(res.data);
      })
      .catch(() => {}); // silently fall back to dummy
  }, []);

  return (
    <GlowCard className="leaderboard">
      <h2 className="leaderboard__title">🏆 LEADERBOARD</h2>
      <div className="leaderboard__list">
        {entries.map((entry, i) => (
          <div key={i} className={`leaderboard__row ${entry.username === user?.username ? 'leaderboard__row--me' : ''}`}>
            <span className="leaderboard__rank" style={{ color: RANK_COLORS[i] || 'rgba(255,255,255,0.5)' }}>
              {RANK_ICONS[i] || `#${i + 1}`}
            </span>
            <span className="leaderboard__name">{entry.username}</span>
            <span className="leaderboard__score">{entry.score.toLocaleString()}</span>
            <span className="leaderboard__level">LV{entry.levelReached}</span>
          </div>
        ))}
      </div>

      <div className="leaderboard__divider" />

      <div className="leaderboard__personal">
        <span>🕹️ YOUR BEST</span>
        <span className="leaderboard__personal-score">
          {isLoggedIn && user?.highScore ? user.highScore.toLocaleString() : '---'}
        </span>
      </div>
    </GlowCard>
  );
}
