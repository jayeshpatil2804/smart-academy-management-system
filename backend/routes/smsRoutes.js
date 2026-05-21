const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getSmsStationData, updateSmsSettings } = require('../controllers/smsController');

// All SMS station routes are restricted to Super Admin or specific roles
// For now, let's just use protect and we can add role checks if needed
router.get('/station', protect, getSmsStationData);
router.put('/settings', protect, updateSmsSettings);

module.exports = router;
