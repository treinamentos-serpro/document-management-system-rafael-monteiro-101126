const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = {
  create,
  findAll,
  findById,
};
