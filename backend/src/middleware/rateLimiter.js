const rateLimit = require('express-rate-limit');

const getPositiveInteger = (name, defaultValue) => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
};

// General API rate limiter (protects all API endpoints from DoS and scraping)
const apiLimiter = rateLimit({
  windowMs: getPositiveInteger('API_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: getPositiveInteger('API_RATE_LIMIT_MAX', 500),
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for Auth endpoints (protects login & register from brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login/register attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

// Limiter for resource creation (projects, join-requests, bulk-invites)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 creates per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Creation rate limit exceeded. Please try again later.'
  }
});

module.exports = { apiLimiter, authLimiter, createLimiter };
