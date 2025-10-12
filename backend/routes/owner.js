const express = require('express');
const { getDashboard } = require('../controllers/ownerController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, authorize('owner'));

router.get('/dashboard', getDashboard);

module.exports = router;