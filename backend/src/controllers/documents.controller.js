const path = require('node:path');
const documentsService = require('../services/documents.service');

const storageDirectory = path.resolve(__dirname, '../../storage');

function toPublicDocument({ id, originalName, size, uploadedAt, owner }) {
  return { id, originalName, size, uploadedAt, owner };
}

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'É necessário enviar um arquivo.' });
  }

  const document = documentsService.createDocument(
    req.file,
    req.get('x-user-id') || 'anonymous',
  );
  return res.status(201).json(toPublicDocument(document));
}

function listDocuments(req, res) {
  return res.json(documentsService.listDocuments().map(toPublicDocument));
}

function downloadDocument(req, res) {
  const document = documentsService.findDocumentById(req.params.id);
  if (!document || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(document.filename)) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(
    path.join(storageDirectory, document.filename),
    document.originalName,
  );
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
