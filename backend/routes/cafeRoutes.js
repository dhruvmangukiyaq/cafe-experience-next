const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');

router.post('/', cafeController.createCafe);
router.get('/', cafeController.getCafes);
router.get('/:id', cafeController.getCafeById);
router.put('/:id', cafeController.updateCafe);
router.delete('/:id', cafeController.deleteCafe);

module.exports = router;