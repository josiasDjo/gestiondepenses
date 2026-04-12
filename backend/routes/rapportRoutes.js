const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/mensuel', rapportController.getRapportMensuel);
router.get('/annuel', rapportController.getRapportAnnuel);
router.get('/export/csv', rapportController.exportTransactionsCSV);

module.exports = router;