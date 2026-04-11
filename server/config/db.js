const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        console.warn("Server is running without Database connection in non-production mode.");
    }
};

module.exports = connectDB;
