const express = require('express');
const { 
  getDashboardStats, 
  addUser, 
  getStores, 
  addStore, 
  getUsers, 
  getUserDetails 
} = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { validateUser, validateStore, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/users', validateUser, handleValidationErrors, addUser);
router.get('/stores', getStores);
router.post('/stores', validateStore, handleValidationErrors, addStore);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);

module.exports = router;