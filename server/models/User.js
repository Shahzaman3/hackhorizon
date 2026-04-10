const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: function requiredPassword() {
            return !this.googleId;
        },
        minlength: 6 
    },
    role: { 
        type: String, 
        enum: ["seller", "buyer"], 
        required: true 
    },
    googleId: {
        type: String,
        sparse: true,
        index: true
    },
    profilePicture: {
        type: String
    },
    gstin: { 
        type: String, 
        required: function requiredGstin() {
            return !this.googleId;
        },
        default: '',
        trim: true, 
        uppercase: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
    if (!this.password || !this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
