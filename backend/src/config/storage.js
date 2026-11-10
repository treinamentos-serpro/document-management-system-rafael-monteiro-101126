const path = require('node:path');

const DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const configuredMaxUploadSize = Number(process.env.MAX_UPLOAD_SIZE);

module.exports = {
  storageDirectory: path.resolve(
    process.env.STORAGE_DIR || path.join(__dirname, '../../storage')
  ),
  maxUploadSize: Number.isFinite(configuredMaxUploadSize) && configuredMaxUploadSize > 0
    ? configuredMaxUploadSize
    : DEFAULT_MAX_UPLOAD_SIZE,
  defaultOwner: process.env.DMS_DEFAULT_OWNER || 'local-user',
};