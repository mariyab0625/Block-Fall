const { Router } = require('express');
const { db, nextId } = require('../db/connection');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = Router();

// POST /api/scores  (auth required)
router.post('/', authMiddleware, (req, res) => {
  const { score, levelReached, linesCleared, durationSec } = req.body;
  try {
    const id = nextId('scores');
    db.get('scores').push({
      id,
      userId: req.user.id,
      score,
      levelReached,
      linesCleared,
      durationSec,
      playedAt: new Date().toISOString(),
    }).write();

    // Update progress
    const prog = db.get('progress').find({ userId: req.user.id });
    const cur  = prog.value() || {};
    prog.assign({
      highScore:  Math.max(cur.highScore  || 0, score),
      maxLevel:   Math.max(cur.maxLevel   || 1, levelReached),
      totalGames: (cur.totalGames || 0) + 1,
      totalLines: (cur.totalLines || 0) + linesCleared,
    }).write();

    res.status(201).json({ message: 'Score saved' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/scores/leaderboard  (public)
router.get('/leaderboard', (req, res) => {
  try {
    const users  = db.get('users').value();
    const scores = db.get('scores').value();

    // Best score per user
    const best = {};
    for (const s of scores) {
      if (!best[s.userId] || s.score > best[s.userId].score) {
        best[s.userId] = s;
      }
    }

    const board = Object.values(best)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s, i) => {
        const user = users.find(u => u.id === s.userId);
        return { rank: i + 1, username: user?.username ?? 'Unknown', score: s.score, levelReached: s.levelReached };
      });

    res.json(board);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/scores/me  (auth required)
router.get('/me', authMiddleware, (req, res) => {
  const rows = db.get('scores')
    .filter({ userId: req.user.id })
    .sortBy('playedAt')
    .reverse()
    .take(20)
    .value();
  res.json(rows);
});

module.exports = router;
