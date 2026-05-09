// routes/auth.js
const express = require('express');
const router  = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { verifyToken, authorize }       = require('../middleware/auth');

router.post('/login',    login);
router.post('/register', verifyToken, authorize('admin'), register);
router.get('/profile',   verifyToken, getProfile);

module.exports = router;
