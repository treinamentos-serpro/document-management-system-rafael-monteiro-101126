const { defaultOwner } = require('../config/storage');
const documentService = require('../services/documentService');

function upload(req, res, next) {
  documentService.upload(req.file, defaultOwner)
    .then((document) => res.status(201).json(document))
    .catch(next);
}

function list(req, res, next) {
  try {
    res.json(documentService.list(defaultOwner));
  } catch (error) {
    next(error);
  }
}

function download(req, res, next) {
  documentService.getDownload(req.params.id, defaultOwner)
    .then(({ document, filePath }) => {
      res.download(filePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    })
    .catch(next);
}

module.exports = { upload, list, download };