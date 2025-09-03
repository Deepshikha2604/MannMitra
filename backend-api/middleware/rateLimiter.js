const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter for general API endpoints
const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes
});

// Rate limiter for authentication endpoints
const authLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 5, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 30, // Block for 30 minutes
});

// Rate limiter for chat endpoints
const chatLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.user ? req.user.userId : req.ip;
  },
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 10, // Block for 10 minutes
});

// Rate limiter for crisis endpoints
const crisisLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 5, // Block for 5 minutes
});

const rateLimiter = async (req, res, next) => {
  try {
    await generalLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

const authRateLimiter = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: `Too many login attempts. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

const chatRateLimiter = async (req, res, next) => {
  try {
    const key = req.user ? req.user.userId : req.ip;
    await chatLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many chat requests',
      message: `Chat rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

const crisisRateLimiter = async (req, res, next) => {
  try {
    await crisisLimiter.consume(req.ip || req.connection.remoteAddress);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too many crisis requests',
      message: `Crisis detection rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

module.exports = {
  rateLimiter,
  authRateLimiter,
  chatRateLimiter,
  crisisRateLimiter
};
