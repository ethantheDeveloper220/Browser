const express = require('express');
const router = express.Router();
const User = require('../models/user');
const PaymentRequest = require('../models/paymentRequest');
const SearchLog = require('../models/searchLog');
const jwt = require('jsonwebtoken');

const authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email === 'ethangamer492@gmail.com' && decoded.role === 'admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ error: 'Admin access required' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'email subscription');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/payment-requests', authenticateAdmin, async (req, res) => {
    try {
        const requests = await PaymentRequest.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payment-requests/:id/approve', authenticateAdmin, async (req, res) => {
    try {
        const request = await PaymentRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        request.status = 'approved';
        await request.save();
        await User.findOneAndUpdate(
            { email: request.email },
            { subscription: request.plan }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payment-requests/:id/reject', authenticateAdmin, async (req, res) => {
    try {
        const request = await PaymentRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        request.status = 'rejected';
        await request.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/search-logs', authenticateAdmin, async (req, res) => {
    try {
        const logs = await SearchLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
