require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const authRoutes     = require('./routes/auth');
const scoreRoutes    = require('./routes/scores');
const progressRoutes = require('./routes/progress');
const { authMiddleware } = require('./middleware/authMiddleware');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.get('/api/scores/leaderboard', require('./routes/scores').leaderboard || ((req, res, next) => next()));

// All routes
app.use('/api/scores',   scoreRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', db: 'json-file' }));

app.listen(PORT, () => {
  console.log(`🚀 BLOCKFALL server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in server/data/blockfall.json`);
});
