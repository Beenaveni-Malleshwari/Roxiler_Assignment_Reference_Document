const express = require('express');
const { getStores, submitRating, updateRating } = require('../controllers/userController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware, authorize('user'));

router.get('/stores', getStores);
router.post('/ratings', validateRating, handleValidationErrors, submitRating);
router.patch('/ratings/:storeId', validateRating, handleValidationErrors, updateRating);

module.exports = router;