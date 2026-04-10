const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user
exports.getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
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

// Switch user role
exports.switchRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newRole = user.role === "seller" ? "buyer" : "seller";
        user.role = newRole;
        await user.save();

        res.status(200).json({
            success: true,
            newRole,
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

        if (!gstin) {
            return res.status(400).json({ success: false, message: "GSTIN is required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { gstin },
            { new: true }
        );

        res.status(200).json({
            success: true,
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

// Register
exports.register = async (req, res, next) => {
    try {
        const { name, email: rawEmail, password, role, gstin } = req.body;
        const email = rawEmail?.trim().toLowerCase();
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
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
        
        const user = await User.findOne({ email });
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
        if (err) {
            return next(err);
        }
        res.status(200).json({ 
            success: true, 
            message: "Logged out successfully" 
        });
    });
};

// Add Business Context
exports.addBusiness = async (req, res, next) => {
    try {
        const { name, gstin, type } = req.body;
        if (!name || !gstin) return res.status(400).json({ success: false, message: "Business name and GSTIN are required" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.businesses.push({ name, gstin, type: type || 'both' });
        await user.save();

        res.status(200).json({
            success: true,
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
