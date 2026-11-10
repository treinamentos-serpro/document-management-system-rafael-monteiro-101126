const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDocumentsService } = require('../src/services/documents.service');

function createRepository() {
  const documents = new Map();
  return {
    create(document) {
      documents.set(document.id, document);
      return document;
    },
    findAll() {
      return Array.from(documents.values());
    },
    findById(id) {
      return documents.get(id) || null;
    },
  };
}

test('serviço cria, lista e localiza documentos pelo repositório', () => {
  const service = createDocumentsService(createRepository());
  const file = {
    originalname: 'relatorio.pdf',
    filename: 'stored-file',
    size: 128,
  };

  const created = service.createDocument(file, 'user-1');

  assert.equal(created.originalName, file.originalname);
  assert.equal(created.filename, file.filename);
  assert.equal(created.size, file.size);
  assert.equal(created.owner, 'user-1');
  assert.ok(created.id);
  assert.ok(Number.isFinite(Date.parse(created.uploadedAt)));
  assert.deepEqual(service.listDocuments(), [created]);
  assert.equal(service.findDocumentById(created.id), created);
  assert.equal(service.findDocumentById('missing'), null);
});
