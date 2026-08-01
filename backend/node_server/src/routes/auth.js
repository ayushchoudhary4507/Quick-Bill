const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getPasswordHash, verifyPassword, createAccessToken } = require('../services/authService');
const settings = require('../config/settings');

/**
 * POST /auth/register
 * Body: { username, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: 'Username and password are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ detail: 'Username already registered' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const hashedPw = await getPasswordHash(password);
    const newUser = await User.create({ username, hashed_password: hashedPw, role });

    return res.status(201).json({ id: newUser._id, username: newUser.username, role: newUser.role });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

/**
 * POST /auth/login
 * Body: application/x-www-form-urlencoded { username, password }
 * Returns: { access_token, token_type }
 * Dev mode: auto-creates user if not found
 */
router.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    console.log(`DEBUG: Login attempt for username='${username}'`);

    if (!username) {
      return res.status(400).json({ detail: 'Username is required' });
    }

    let user = await User.findOne({ username });

    // Dev mode: create user if not found
    if (!user) {
      console.log(`DEBUG: User '${username}' not found. Creating temporary user.`);
      const hashedPw = await getPasswordHash('password');
      user = await User.create({ username, hashed_password: hashedPw, role: 'admin' });
    }

    console.log(`DEBUG: Bypassing password check for '${username}'`);

    const accessToken = createAccessToken(
      { sub: user.username, role: user.role, id: user._id.toString() },
      settings.accessTokenExpireMinutes
    );

    return res.json({ access_token: accessToken, token_type: 'bearer' });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
