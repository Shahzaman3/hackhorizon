const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Minimal projection for session hydration
const SESSION_USER_PROJECTION = 'name email role gstin profilePicture googleId';

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        // OPTIMIZATION: Use .lean() and focused projection to speed up every authenticated request
        const user = await User.findById(id).select(SESSION_USER_PROJECTION).lean();
        if (user) {
            user.id = user._id.toString(); // Ensure consistency with expected passport user object
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // select only needed fields
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        profilePicture: profile.photos[0]?.value,
                        role: 'buyer',
                        gstin: ''
                    });
                } else {
                    // Update profile details only if changed, using atomic updates where possible
                    const hasChanges = user.name !== profile.displayName || user.email !== profile.emails[0]?.value;
                    if (hasChanges) {
                        user.name = profile.displayName || user.name;
                        user.email = profile.emails[0]?.value || user.email;
                        user.profilePicture = profile.photos[0]?.value || user.profilePicture || '';
                        await user.save();
                    }
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
