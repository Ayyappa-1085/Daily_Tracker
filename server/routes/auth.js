const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { ensureDefaults } = require('../utils/defaults');

const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and an 8-character password are required.' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    await ensureDefaults(user._id);
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(500).json({ message: 'Unable to create account.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    const passwordHash = user.passwordHash || user.password;
    if (typeof passwordHash !== 'string' || !passwordHash) {
      console.error('Login failed: user record has no password hash.', { userId: user._id.toString() });
      return res.status(500).json({ message: 'Unable to sign in.' });
    }
    if (!(await bcrypt.compare(req.body.password || '', passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login failed:', { name: error.name, code: error.code, message: error.message });
    res.status(500).json({ message: 'Unable to sign in.' });
  }
});

router.get('/me', auth, (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } }));
module.exports = router;