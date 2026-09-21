const express = require('express');
const {
  createCafe,
  getCafes,
  getCafeById,
  updateCafe,
  deleteCafe,
} = require('../controllers/cafeController');
const protect = require('../middleware/auth');

const router = express.Router();

// /api/cafes (write routes need login; reading stays public)
router.route('/').post(protect, createCafe).get(getCafes);

// /api/cafes/:id (write routes need login; reading stays public)
router.route('/:id').get(getCafeById).put(protect, updateCafe).delete(protect, deleteCafe);

module.exports = router;
