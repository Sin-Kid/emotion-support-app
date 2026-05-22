const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env.server' });

const JWT_SECRET = process.env.JWT_SECRET || 'mindcare_super_secret_key_change_in_production';

/**
 * Middleware: require a valid JWT token
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * Middleware: require admin role
 */
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
