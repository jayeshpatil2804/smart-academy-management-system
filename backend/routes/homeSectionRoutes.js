const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const bannerUpload = require('../middlewares/bannerUploadMiddleware');
const { getPublicSections, getAllSections, upsertSection } = require('../controllers/homeSectionController');

router.get('/public', getPublicSections);
router.get('/', protect, getAllSections);
router.post('/', protect, bannerUpload.single('image'), upsertSection);

module.exports = router;
