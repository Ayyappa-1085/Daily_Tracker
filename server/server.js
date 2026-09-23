require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...clientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '20kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/weight', require('./routes/weight'));

app.use((error, req, res, next) =>
  res.status(500).json({ message: 'Something went wrong.' })
);

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusday';
const port = process.env.PORT || 5000;

mongoose.connect(mongoUri)
  .then(() =>
    app.listen(
      port,
      '0.0.0.0',
      () => console.log(`FocusDay API listening on ${port}`)
    )
  )
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });