function createDownloadRateLimiter({ limit = 60, windowMs = 60_000 } = {}) {
  const requestsByIp = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestsByIp) {
      if (entry.resetAt <= now) requestsByIp.delete(ip);
    }
  }, windowMs);
  cleanup.unref();

  return function downloadRateLimiter(req, res, next) {
    const now = Date.now();
    const ip = req.ip;
    let entry = requestsByIp.get(ip);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      requestsByIp.set(ip, entry);
    }

    if (entry.count >= limit) {
      res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Limite de downloads excedido.' });
    }

    entry.count += 1;
    return next();
  };
}

module.exports = createDownloadRateLimiter;
