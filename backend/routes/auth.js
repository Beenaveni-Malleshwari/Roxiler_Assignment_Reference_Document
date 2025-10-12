const express = require('express');
const { signup, login, updatePassword } = require('../controllers/authController');
const { validateUser, validateSignup, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.patch('/update-password', authMiddleware, updatePassword);

module.exports = router;