const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Projection helper to avoid fetching sensitive or massive fields repeatedly
const USER_PROJECTION = 'name email role gstin profilePicture businesses';

// Get current user
exports.getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        // OPTIMIZATION: Use .lean() and focused projection for faster read
        const user = await User.findById(req.user.id).select(USER_PROJECTION).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                ...user
            }
        });
    } catch (err) {
        next(err);
    }
};

// Switch user role
exports.switchRole = async (req, res, next) => {
    try {
        // OPTIMIZATION: atomic update to avoid double DB round-trips
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.role = user.role === "seller" ? "buyer" : "seller";
        await user.save();

        res.status(200).json({
            success: true,
            newRole: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                gstin: user.gstin,
                profilePicture: user.profilePicture,
                businesses: user.businesses
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
        if (!gstin) return res.status(400).json({ success: false, message: "GSTIN is required" });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { gstin },
            { new: true, select: USER_PROJECTION }
        ).lean();

        res.status(200).json({
            success: true,
            user: { id: user._id, ...user }
        });
    } catch (err) {
        next(err);
    }
};

// Register
exports.register = async (req, res, next) => {
    try {
        const { name, email: rawEmail, password, role, gstin } = req.body;
        const email = rawEmail?.trim().toLowerCase();
        
        // OPTIMIZATION: select only _id to check existence
        const existing = await User.findOne({ email }).select('_id').lean();
        if (existing) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            gstin
        });

        req.login(user, (err) => {
            if (err) return next(err);
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        gstin: user.gstin,
                        profilePicture: user.profilePicture,
                        businesses: user.businesses
                    }
                }
            });
        });
    } catch (err) {
        next(err);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email: rawEmail, password } = req.body;
        const email = rawEmail?.trim().toLowerCase();
        
        // Select only needed fields for credential check
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        gstin: user.gstin,
                        profilePicture: user.profilePicture,
                        businesses: user.businesses
                    }
                }
            });
        });
    } catch (err) {
        next(err);
    }
};

// Logout
exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    });
};

// Add Business
exports.addBusiness = async (req, res, next) => {
    try {
        const { name, gstin, type } = req.body;
        if (!name || !gstin) return res.status(400).json({ success: false, message: "Business name and GSTIN are required" });

        // Update directly in DB to avoid loading user into memory
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { businesses: { name, gstin, type: type || 'both' } } },
            { new: true, select: USER_PROJECTION }
        ).lean();

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            user: { id: user._id, ...user }
        });
    } catch (err) {
        next(err);
    }
};
