const { randomUUID } = require('node:crypto');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const createDownloadRateLimiter = require('../middleware/download-rate-limit.middleware');

const router = express.Router();
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../storage'),
  filename: (req, file, callback) => callback(null, randomUUID()),
});
const upload = multer({ storage });
const downloadRateLimiter = createDownloadRateLimiter();

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get(
  '/documents/:id/download',
  downloadRateLimiter,
  documentsController.downloadDocument,
);

module.exports = router;
