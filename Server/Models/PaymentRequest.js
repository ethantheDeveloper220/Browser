const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    plan: { type: String, enum: ['home-tester', 'all-day'], required: true },
    cardNumber: { type: String, required: true },
    cardExpiry: { type: String, required: true },
    cardCvv: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
