const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

// Garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let uploadedId;

  try {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo de teste']), 'teste.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);
    const uploadedDocument = await uploadResponse.json();
    uploadedId = uploadedDocument.id;
    assert.deepStrictEqual(
      Object.keys(uploadedDocument).sort(),
      ['id', 'originalName', 'owner', 'size', 'uploadedAt'].sort()
    );
    assert.strictEqual(uploadedDocument.originalName, 'teste.txt');
    assert.strictEqual(uploadedDocument.size, 17);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual(await listResponse.json(), [uploadedDocument]);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedId}/download`
    );
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');
    assert.match(downloadResponse.headers.get('content-disposition'), /teste\.txt/);

    const missingResponse = await fetch(
      `${baseUrl}/documents/ausente/download`
    );
    assert.strictEqual(missingResponse.status, 404);
  } finally {
    server.close();
    if (uploadedId) {
      const document = documentRepository.deleteById(uploadedId);
      await fs.rm(documentRepository.getFilePath(document.storageName), { force: true });
    }
  }
});

test('rejeita upload sem arquivo', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
      method: 'POST',
      body: new FormData(),
    });
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'FILE_REQUIRED');
  } finally {
    server.close();
  }
});
