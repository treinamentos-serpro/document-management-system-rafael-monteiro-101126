const { rateLimit } = require('express-rate-limit');

function createDownloadRateLimiter({ limit = 60, windowMs = 60_000 } = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite de downloads excedido.' },
  });
}

module.exports = createDownloadRateLimiter;
