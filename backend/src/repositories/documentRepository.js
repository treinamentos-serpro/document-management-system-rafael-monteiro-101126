const path = require('node:path');
const { storageDirectory } = require('../config/storage');

class DocumentRepository {
  constructor() {
    this.documents = new Map();
  }

  save(document) {
    this.documents.set(document.id, { ...document });
    return { ...document };
  }

  findAllByOwner(owner) {
    return [...this.documents.values()]
      .filter((document) => document.owner === owner)
      .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
      .map((document) => ({ ...document }));
  }

  findByIdAndOwner(id, owner) {
    const document = this.documents.get(id);
    return document && document.owner === owner ? { ...document } : null;
  }

  getFilePath(storageName) {
    const isUuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(storageName);
    if (!isUuid) {
      throw new Error('Nome de armazenamento inválido.');
    }

    return path.join(storageDirectory, storageName);
  }

  deleteById(id) {
    const document = this.documents.get(id);
    this.documents.delete(id);
    return document ? { ...document } : null;
  }
}

module.exports = new DocumentRepository();