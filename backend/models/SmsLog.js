const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'disabled'],
        required: true
    },
    response: {
        type: mongoose.Schema.Types.Mixed
    },
    error: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', smsLogSchema);
