const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  googleAuth, 
  googleCallback, 
  getProfile,
  logout 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, userValidators } = require('../middlewares/validationMiddleware');

// Routes classiques
router.post('/register', register);
router.post('/login', login);

// Routes Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Routes protégées
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logout);

module.exports = router;