const rateLimit = require('express-rate-limit');

const standardHeaders = true;
const legacyHeaders = false;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders,
  legacyHeaders,
  message: { success: false, message: 'Too many auth requests. Try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders,
  legacyHeaders,
  message: { success: false, message: 'Rate limit exceeded. Slow down your requests.' },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders,
  legacyHeaders,
  message: { success: false, message: 'Too many write operations. Please retry shortly.' },
});

module.exports = {
  authLimiter,
  apiLimiter,
  writeLimiter,
};
