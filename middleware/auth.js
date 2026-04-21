const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Protects routes that require authentication
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('ACCESS_TOKEN_SECRET is not configured');
    return res.status(500).json({ 
      error: 'Server configuration error' 
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired', 
          message: 'Please refresh your token or log in again' 
        });
      }
      return res.status(403).json({ 
        error: 'Invalid token', 
        message: 'Token verification failed' 
      });
    }
    
    req.user = decoded;
    next();
  });
};

/**
 * Optional authentication - allows request to continue even without token
 * Useful for routes that can be accessed both authenticated and unauthenticated
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};

/**
 * Role-based access control middleware
 * @param {number[]} allowedRoles - Array of role IDs that are allowed
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to access this resource' 
      });
    }

    next();
  };
};

module.exports = { 
  authenticateToken, 
  optionalAuth, 
  requireRole 
};
