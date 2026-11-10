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
      fs.mkdir(storageDirectory, { recursive: true, mode: 0o700 }, (error) => {
        if (error) return callback(error);

        fs.chmod(storageDirectory, 0o700, (chmodError) => {
          callback(chmodError, storageDirectory);
        });
      });
    },
    filename(req, file, callback) {
      callback(null, crypto.randomUUID());
    },
  }),
  limits: { fileSize: maxUploadSize, files: 1, fields: 0, parts: 2 },
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;