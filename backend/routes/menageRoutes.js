const express = require('express');
const router = express.Router();
const menageController = require('../controllers/menageController');
const { protect, isMembreMenage } = require('../middlewares/authMiddleware');

// router.post('/', menageController.createMenage);
// router.get('/', menageController.getMesMenages)
router.get('/utilisateur/menages', menageController.getAllMenageUser)

module.exports = router;