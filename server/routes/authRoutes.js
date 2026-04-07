const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } 
        );
        res.json({ token, user: { id: user._id, username, email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Much better for a "Vault"
        );
        res.json({ token, user: { id: user._id, username: user.username, email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete-account', auth, async (req, res) => {
    try {
        await Link.deleteMany({ user: req.user.id });

        await User.findByIdAndDelete(req.user.id);

        res.json({ message: "Account and data purged" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error: Could not delete account" });
    }
});

module.exports = router;