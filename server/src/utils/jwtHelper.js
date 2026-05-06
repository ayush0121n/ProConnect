const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token
 * @param {string} id - User ID
 * @param {string} [expiresIn] - Expiry duration (default from env)
 */
exports.generateToken = (id, expiresIn = process.env.JWT_EXPIRE || '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
