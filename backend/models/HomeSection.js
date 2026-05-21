const mongoose = require('mongoose');

const homeSectionSchema = new mongoose.Schema({
    sectionKey: { type: String, required: true, unique: true }, // 'md_message' | 'heritage'
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    quote: { type: String, default: '' },
    buttonLabel: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('HomeSection', homeSectionSchema);
