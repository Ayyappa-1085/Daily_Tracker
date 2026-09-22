require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
const allowedOrigins = new Set([
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
} }));
app.use(express.json({ limit: '20kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/analytics', require('./routes/analytics'));

app.use((error, req, res, next) =>
  res.status(500).json({ message: 'Something went wrong.' })
);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/focusday')
  .then(() =>
    app.listen(
      process.env.PORT || 5000,
      () => console.log(`FocusDay API listening on ${process.env.PORT || 5000}`)
    )
  )
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });