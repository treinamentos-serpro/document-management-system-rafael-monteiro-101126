const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const express = require('express');
const { maxUploadSize, storageDirectory } = require('../config/storage');
const documentController = require('../controllers/documentController');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, crypto.randomUUID());
    },
  }),
  limits: { fileSize: maxUploadSize, files: 1 },
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;