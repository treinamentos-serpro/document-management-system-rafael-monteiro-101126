const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

function createDocumentsService(repository = documentsRepository) {
  function createDocument(file, owner = 'anonymous') {
    return repository.create({
      id: randomUUID(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
    });
  }

  function listDocuments() {
    return repository.findAll();
  }

  function findDocumentById(id) {
    return repository.findById(id);
  }

  return {
    createDocument,
    listDocuments,
    findDocumentById,
  };
}

module.exports = createDocumentsService();
module.exports.createDocumentsService = createDocumentsService;
