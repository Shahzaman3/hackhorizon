require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');
const requestRoutes = require('./routes/requests');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true 
}));
app.use(passport.initialize());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: "InvoiceSync API running" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || "Internal server error" 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});