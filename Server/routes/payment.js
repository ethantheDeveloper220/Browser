const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PaymentRequest = require('../models/paymentRequest');

router.post('/submit', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const { plan, cardNumber, cardExpiry, cardCvv } = req.body;
    if (!plan || !cardNumber || !cardExpiry || !cardCvv) {
        return res.status(400).json({ error: 'All fields required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedCardNumber = await bcrypt.hash(cardNumber, 10);
        const hashedCvv = await bcrypt.hash(cardCvv, 10);
        const paymentRequest = new PaymentRequest({
            email: decoded.email,
            plan,
            cardNumber: hashedCardNumber,
            cardExpiry,
            cardCvv: hashedCvv
        });
        await paymentRequest.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
