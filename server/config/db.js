const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        // Soft fail instead of crashing Node so the local server still runs for frontend UI tests
        console.warn("Server is running without Database connection limit.");
    }
};

module.exports = connectDB;
