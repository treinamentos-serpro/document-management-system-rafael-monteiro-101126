const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const createDownloadRateLimiter = require('../src/middleware/download-rate-limit.middleware');

test('limita downloads por endereço IP e informa quando tentar novamente', async () => {
  const app = express();
  app.get('/', createDownloadRateLimiter({ limit: 1 }), (req, res) => res.send('ok'));
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    assert.equal((await fetch(url)).status, 200);
    const limitedResponse = await fetch(url);
    assert.equal(limitedResponse.status, 429);
    assert.ok(Number(limitedResponse.headers.get('retry-after')) > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
