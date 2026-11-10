const { after, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const storageDirectory = path.join(os.tmpdir(), `dms-test-${randomUUID()}`);
process.env.STORAGE_DIR = storageDirectory;

const app = require('../src/app');

after(async () => {
  await fs.rm(storageDirectory, { recursive: true, force: true });
});

// Garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo de teste']), 'relatorio.pdf');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);
    const uploadedDocument = await uploadResponse.json();
    assert.strictEqual(uploadedDocument.originalName, 'relatorio.pdf');
    assert.strictEqual(uploadedDocument.size, 17);
    assert.ok(uploadedDocument.id);
    assert.ok(uploadedDocument.uploadedAt);
    assert.ok(uploadedDocument.owner);
    assert.strictEqual(Object.hasOwn(uploadedDocument, 'storageName'), false);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual(await listResponse.json(), [uploadedDocument]);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`
    );
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');
    assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.pdf/);

    const missingResponse = await fetch(`${baseUrl}/documents/ausente/download`);
    assert.strictEqual(missingResponse.status, 404);
  } finally {
    await new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    });
  }
});

test('rejeita upload sem arquivo', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
      method: 'POST',
      body: new FormData(),
    });
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'FILE_REQUIRED');
  } finally {
    await new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    });
  }
});
