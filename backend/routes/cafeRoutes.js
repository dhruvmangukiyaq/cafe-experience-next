const express = require('express');
const {
  createCafe,
  getCafes,
  getCafeById,
  updateCafe,
  deleteCafe,
} = require('../controllers/cafeController');

const router = express.Router();

// /api/cafes
router.route('/').post(createCafe).get(getCafes);

// /api/cafes/:id
router.route('/:id').get(getCafeById).put(updateCafe).delete(deleteCafe);

module.exports = router;
