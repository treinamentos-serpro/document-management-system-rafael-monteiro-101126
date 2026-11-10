const { test } = require('node:test');
const assert = require('node:assert/strict');
const createDownloadRateLimiter = require('../src/middleware/download-rate-limit.middleware');

test('limita downloads por endereço IP e informa quando tentar novamente', () => {
  const rateLimiter = createDownloadRateLimiter({ limit: 1, windowMs: 60_000 });
  const req = { ip: '127.0.0.1' };
  let statusCode;
  let retryAfter;
  let nextCalls = 0;
  const res = {
    set(name, value) {
      if (name === 'Retry-After') retryAfter = value;
      return this;
    },
    status(value) {
      statusCode = value;
      return this;
    },
    json(body) {
      return body;
    },
  };

  rateLimiter(req, res, () => nextCalls++);
  rateLimiter(req, res, () => nextCalls++);

  assert.equal(nextCalls, 1);
  assert.equal(statusCode, 429);
  assert.equal(Number(retryAfter) > 0, true);
});
