const express = require('express');
const {
  uploadMiddleware,
  uploadFiles,
  listFiles,
  getFile,
  deleteFile,
} = require('../controllers/uploadController');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, uploadMiddleware, uploadFiles);
router.get('/', listFiles);
router.get('/:id', getFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
