const HomeSection = require('../models/HomeSection');

// Public - get all active sections
exports.getPublicSections = async (req, res) => {
    try {
        const sections = await HomeSection.find({ isActive: true });
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
};

// Admin - get all sections
exports.getAllSections = async (req, res) => {
    try {
        const sections = await HomeSection.find();
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
};

// Admin - upsert section by sectionKey
exports.upsertSection = async (req, res) => {
    try {
        const { sectionKey, title, subtitle, description, quote, buttonLabel, isActive } = req.body;
        const updateData = { title, subtitle, description, quote, buttonLabel, isActive };
        if (req.file) updateData.image = req.file.path;

        const section = await HomeSection.findOneAndUpdate(
            { sectionKey },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ message: 'Section saved successfully', section });
    } catch (error) {
        res.status(500).json({ message: 'Error saving section', error: error.message });
    }
};
