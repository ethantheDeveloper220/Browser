const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SearchLog = require('../models/searchLog');

router.post('/log', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.subscription !== 'none' || user.role === 'admin') {
            await SearchLog.create({ email: decoded.email, url });
            return res.json({ success: true });
        }
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const searchCount = await SearchLog.countDocuments({
            email: decoded.email,
            timestamp: { $gte: oneHourAgo }
        });
        if (searchCount >= 5) {
            return res.status(429).json({ error: 'Search limit exceeded (5/hour for free users)' });
        }
        await SearchLog.create({ email: decoded.email, url });
        res.json({ success: true, remainingSearches: 5 - (searchCount + 1) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
