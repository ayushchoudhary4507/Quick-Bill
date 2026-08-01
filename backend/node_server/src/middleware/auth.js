const jwt = require('jsonwebtoken');
const settings = require('../config/settings');
const User = require('../models/User');

/**
 * JWT auth middleware — verifies Bearer token and attaches user to req.user
 * Equivalent to FastAPI's get_current_user dependency
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, settings.secretKey);
    const username = payload.sub;
    if (!username) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] JWT error:', err.message);
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }
}

module.exports = authMiddleware;
