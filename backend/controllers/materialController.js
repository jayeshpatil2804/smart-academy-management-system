const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// @desc    Get all materials with filters
// @route   GET /api/materials
// @access  Private/Public (depending on type)
const getMaterials = asyncHandler(async (req, res) => {
    const { fromDate, toDate, type, searchBy, value, isActive } = req.query;

    let query = {};

    // Date Filter
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt.$lte = endOfDay;
        }
    }

    // Type Filter
    if (type && type !== 'All' && type !== '') {
        query.type = type;
    }
    
    // Search By (Subject Name or Title)
    if (searchBy && value) {
        if (searchBy === 'subject') {
             if (searchBy === 'title') {
                query.title = { $regex: value, $options: 'i' };
            }
        } else if (value) {
             query.title = { $regex: value, $options: 'i' };
        }
    }

    if (isActive) {
        query.isActive = isActive === 'true';
    }

    // Student View Filter (Public + Student accessible)
    if (req.query.studentView === 'true') {
        query.type = { $in: ['Public', 'Student only', 'Student and Faculty only'] };
        query.isActive = true; // Force active only
    }

    let materials = await Material.find(query)
        .populate('subject', 'name')
        .sort({ createdAt: -1 });

    // Post-query filtering for Subject Name if needed
    if (searchBy === 'subject' && value) {
        materials = materials.filter(m => m.subject?.name?.toLowerCase().includes(value.toLowerCase()));
    }

    res.json(materials);
});

// @desc    Download material document
// @route   GET /api/materials/download/:id
// @access  Public
const downloadMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (!material || !material.document) {
        res.status(404); throw new Error('Document not found');
    }

    const filePath = path.resolve(material.document);
    if (!fs.existsSync(filePath)) {
        res.status(404); throw new Error('File not found on server');
    }

    const ext = path.extname(material.document);
    const safeTitle = material.title.replace(/[^a-zA-Z0-9]/g, "_");
    const downloadFileName = `${safeTitle}${ext}`;

    res.download(filePath, downloadFileName);
});

// @desc    Create new material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = asyncHandler(async (req, res) => {
    const { subject, title, type, description, isActive } = req.body;
    const documentPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const material = await Material.create({
        subject,
        title,
        type,
        document: documentPath,
        description,
        isActive: isActive === 'true' || isActive === true
    });

    const populatedMaterial = await Material.findById(material._id).populate('subject', 'name');
    res.status(201).json(populatedMaterial);
});

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    const { subject, title, type, description, isActive } = req.body;

    if (subject) material.subject = subject;
    if (title) material.title = title;
    if (type) material.type = type;
    if (description !== undefined) material.description = description;
    if (isActive !== undefined) material.isActive = (isActive === 'true' || isActive === true);

    if (req.file) {
        if (material.document && fs.existsSync(material.document)) {
            if (material.document.startsWith('uploads')) {
                 try { fs.unlinkSync(material.document); } catch (err) {}
            }
        }
        material.document = req.file.path.replace(/\\/g, "/");
    }

    const updatedMaterial = await material.save();
    const populatedUpdatedMaterial = await Material.findById(updatedMaterial._id).populate('subject', 'name');
    res.json(populatedUpdatedMaterial);
});

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    if (material.document && fs.existsSync(material.document)) {
         if (material.document.startsWith('uploads')) {
            try { fs.unlinkSync(material.document); } catch (err) {}
        }
    }

    await material.deleteOne();
    res.json({ message: 'Material removed' });
});

module.exports = {
    getMaterials,
    downloadMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
