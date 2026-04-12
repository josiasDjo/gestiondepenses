const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, userValidators } = require('../middlewares/validationMiddleware');

router.post('/register', validate(userValidators), register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

module.exports = router;