const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const documentRepository = require('../repositories/documentRepository');

function createError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

class DocumentService {
  constructor(repository = documentRepository) {
    this.repository = repository;
  }

  async upload(file, owner) {
    if (!file) {
      throw createError(400, 'FILE_REQUIRED', 'Selecione um arquivo para enviar.');
    }

    const document = {
      id: randomUUID(),
      originalName: path.basename(file.originalname.replaceAll('\\', '/')).replace(/[\r\n\0]/g, ''),
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storageName: file.filename,
    };

    try {
      await fs.chmod(file.path, 0o600);
      this.repository.save(document);
    } catch (error) {
      await fs.rm(file.path, { force: true }).catch(() => {});
      throw error;
    }

    return toPublicDocument(document);
  }

  list(owner) {
    return this.repository.findAllByOwner(owner).map(toPublicDocument);
  }

  async getDownload(id, owner) {
    const document = this.repository.findByIdAndOwner(id, owner);
    if (!document) {
      throw createError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    const filePath = this.repository.getFilePath(document.storageName);
    try {
      await fs.access(filePath);
    } catch {
      throw createError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    return { document: toPublicDocument(document), filePath };
  }
}

module.exports = new DocumentService();