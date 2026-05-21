const express = require('express');
const router = express.Router();
const {
    createGallery,
    addImages,
    getGalleries,
    getPublicGalleries,
    getPublicCategories,
    getGalleryById,
    updateGallery,
    deleteImage,
    deleteGallery
} = require('../controllers/galleryController');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/galleryCategoryController');
const { protect } = require('../middlewares/authMiddleware');
const galleryUpload = require('../middlewares/galleryUploadMiddleware');

router.get('/public', getPublicGalleries);
router.get('/public/categories', getPublicCategories);

router.route('/categories')
    .get(getCategories)
    .post(protect, createCategory);

router.route('/categories/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

router.route('/')
    .get(protect, getGalleries)
    .post(protect, galleryUpload.array('images', 5), createGallery);

router.route('/:id')
    .get(getGalleryById)
    .put(protect, updateGallery)
    .delete(protect, deleteGallery);

router.post('/:id/images', protect, galleryUpload.array('images', 5), addImages);
router.delete('/:id/images', protect, deleteImage);

module.exports = router;
