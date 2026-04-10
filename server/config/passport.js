const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'MOCK_GOOGLE_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MOCK_GOOGLE_CLIENT_SECRET',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleEmail = profile.emails?.[0]?.value?.toLowerCase();
                let user = await User.findOne({
                    $or: [
                        { googleId: profile.id },
                        { email: googleEmail }
                    ]
                });

                if (!user) {
                    // Create new user on first login
                    user = await User.create({
                        googleId: profile.id,
                        email: googleEmail,
                        name: profile.displayName,
                        profilePicture: profile.photos[0]?.value,
                        role: 'buyer', // Default role for new users
                        gstin: ''
                    });
                } else if (!user.googleId) {
                    // Link an existing local account to Google login.
                    user.googleId = profile.id;
                    user.profilePicture = profile.photos[0]?.value || user.profilePicture;
                    await user.save();
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
