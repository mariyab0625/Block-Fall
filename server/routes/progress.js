const { Router } = require('express');
const { db } = require('../db/connection');

const router = Router();

// GET /api/progress
router.get('/', (req, res) => {
  const row = db.get('progress').find({ userId: req.user.id }).value() || {};
  res.json(row);
});

// POST /api/progress/save
router.post('/save', (req, res) => {
  const { savedGrid, savedLevel, savedScore, savedFallMs, savedNextPiece } = req.body;
  try {
    db.get('progress')
      .find({ userId: req.user.id })
      .assign({
        savedGrid,
        savedLevel,
        savedScore,
        savedFallMs,
        savedNextPiece,
        hasSavedGame: true,
        lastSavedAt: new Date().toISOString(),
      })
      .write();
    res.json({ message: 'Progress saved' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/progress/save
router.delete('/save', (req, res) => {
  try {
    db.get('progress')
      .find({ userId: req.user.id })
      .assign({ hasSavedGame: false, savedGrid: null, savedNextPiece: null })
      .write();
    res.json({ message: 'Saved game cleared' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
