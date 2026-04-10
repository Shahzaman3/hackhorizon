const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'invoice-sync-secret';

const signToken = (user) => jwt.sign(
    {
        userId: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        gstin: user.gstin || ''
    },
    JWT_SECRET,
    { expiresIn: '7d' }
);

const buildUserResponse = (user) => ({
    id: user._id.toString(),
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    gstin: user.gstin,
    profilePicture: user.profilePicture
});

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, gstin } = req.body;

        if (!name || !email || !password || !role || !gstin) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!['seller', 'buyer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role selected' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email is already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            gstin
        });

        const token = signToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: buildUserResponse(user),
                token
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Use Google Sign-In for this account' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = signToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: buildUserResponse(user),
                token
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.handleGoogleCallback = async (req, res) => {
    const token = signToken(req.user);
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = `${clientBaseUrl}/oauth/callback?token=${encodeURIComponent(token)}`;

    res.redirect(redirectUrl);
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                user: buildUserResponse(user)
            }
        });
    } catch (err) {
        next(err);
    }
};

// Switch user role
exports.switchRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newRole = user.role === "seller" ? "buyer" : "seller";
        user.role = newRole;
        await user.save();

        const token = signToken(user);

        res.status(200).json({
            success: true,
            data: {
                newRole,
                token,
                user: buildUserResponse(user)
            }
        });
    } catch (err) {
        next(err);
    }
};

// Update user GSTIN
exports.updateGstin = async (req, res, next) => {
    try {
        const { gstin } = req.body;

        if (!gstin) {
            return res.status(400).json({ success: false, message: "GSTIN is required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { gstin },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: {
                user: buildUserResponse(user),
                token: signToken(user)
            }
        });
    } catch (err) {
        next(err);
    }
};

// Logout
exports.logout = (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
