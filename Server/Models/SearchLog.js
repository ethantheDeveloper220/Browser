const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    email: { type: String, required: true },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
