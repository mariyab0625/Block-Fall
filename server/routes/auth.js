const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { db, nextId } = require('../db/connection');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/jwt');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authLimiter }    = require('../middleware/rateLimiter');

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const exists = db.get('users').find(u => u.username === username || u.email === email).value();
  if (exists) return res.status(409).json({ message: 'Username or email already taken' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const id   = nextId('users');
    const user = { id, username, email, password: hash, createdAt: new Date().toISOString() };
    db.get('users').push(user).write();

    // Create progress record
    const pid = nextId('progress');
    db.get('progress').push({
      id: pid, userId: id,
      highScore: 0, maxLevel: 1, totalGames: 0, totalLines: 0,
      savedGrid: null, savedLevel: 1, savedScore: 0, savedFallMs: 1500,
      savedNextPiece: null, hasSavedGame: false,
      lastSavedAt: new Date().toISOString(),
    }).write();

    res.status(201).json({ message: 'Account created', user: { id, username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });

  const user = db.get('users').find({ username }).value();
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  try {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const progress = db.get('progress').find({ userId: user.id }).value() || {};
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        highScore:  progress.highScore  ?? 0,
        maxLevel:   progress.maxLevel   ?? 1,
        totalGames: progress.totalGames ?? 0,
        savedGame:  progress.hasSavedGame ?? false,
      },
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });

  const progress = db.get('progress').find({ userId: user.id }).value() || {};
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      highScore:  progress.highScore  ?? 0,
      maxLevel:   progress.maxLevel   ?? 1,
      totalGames: progress.totalGames ?? 0,
      savedGame:  progress.hasSavedGame ?? false,
    },
  });
});

module.exports = router;
