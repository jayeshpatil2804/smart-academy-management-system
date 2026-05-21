const GalleryCategory = require('../models/GalleryCategory');
const asyncHandler = require('express-async-handler');

// @desc    Get all gallery categories
// @route   GET /api/galleries/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await GalleryCategory.find({}).sort('name');
    res.json(categories);
});

// @desc    Create new gallery category
// @route   POST /api/galleries/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
    const { name, isActive } = req.body;

    if (!name) {
        res.status(400); throw new Error('Category name is required');
    }

    const existing = await GalleryCategory.findOne({ name: name.trim() });
    if (existing) {
        res.status(400); throw new Error('Category with this name already exists');
    }

    const category = await GalleryCategory.create({
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(category);
});

// @desc    Update gallery category
// @route   PUT /api/galleries/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
    const { name, isActive } = req.body;
    const category = await GalleryCategory.findById(req.params.id);

    if (!category) {
        res.status(404); throw new Error('Category not found');
    }

    if (name) {
        const existing = await GalleryCategory.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
        if (existing) {
            res.status(400); throw new Error('Category with this name already exists');
        }
        category.name = name.trim();
    }

    if (isActive !== undefined) {
        category.isActive = isActive;
    }

    const updated = await category.save();
    res.json(updated);
});

// @desc    Delete gallery category
// @route   DELETE /api/galleries/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await GalleryCategory.findById(req.params.id);

    if (!category) {
        res.status(404); throw new Error('Category not found');
    }

    await category.deleteOne();
    res.json({ message: 'Category removed successfully' });
});

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
