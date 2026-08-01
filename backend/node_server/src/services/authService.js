const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const settings = require('../config/settings');

/**
 * Hash a plain-text password
 */
async function getPasswordHash(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a plain password against its bcrypt hash
 */
async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

/**
 * Create a signed JWT access token
 * Payload: { sub: username, role, id }
 */
function createAccessToken(data, expireMinutes) {
  const minutes = expireMinutes || settings.accessTokenExpireMinutes;
  const token = jwt.sign(data, settings.secretKey, {
    algorithm: settings.algorithm,
    expiresIn: `${minutes}m`,
  });
  return token;
}

/**
 * Decode a JWT token (returns payload or null)
 */
function decodeToken(token) {
  try {
    return jwt.verify(token, settings.secretKey);
  } catch {
    return null;
  }
}

module.exports = { getPasswordHash, verifyPassword, createAccessToken, decodeToken };
