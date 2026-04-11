const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

require('./config/passport');

validateEnv();

// Connect to Database
connectDB();

const app = express();

// OPTIMIZATION: Compression reduces JSON payload size by 70-80%
app.use(compression());

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// SECURITY & PERFORMANCE: Helmet sets secure headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '1mb' }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ 
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// OPTIMIZATION: Extended cookie maxAge to 7 days for a smoother 'persistent' user experience
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 7 * 24 * 60 * 60,
        autoRemove: 'native',
    }),
    name: 'invoicesync.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));

// Simple profiling middleware for development (can be removed in production)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            if (duration > 500) {
                console.warn(`[PERF WARNING] ${req.method} ${req.originalUrl} took ${duration}ms`);
            }
        });
        next();
    });
}

app.get('/', (req, res) => res.json({ success: true, message: "InvoiceSync API optimized" }));
app.get('/healthz', (req, res) => res.status(200).json({ success: true, status: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Optimized server running on port ${PORT}`));
