const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Serialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true  // Pass request to callback to access app_slug
}, async (req, email, password, done) => {
    try {
        const { app_slug, platform_type, provider } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return done(null, false, { message: 'Invalid Credentials' });
        }
        
        // If user registered with Google, they might not have a password
        if (!user.password) {
             return done(null, false, { message: 'Please log in with Google' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid Credentials' });
        }

        // Verify user has access to this app_slug
        if (app_slug) {
            const { UserPlatform } = require('../models');
            const userPlatform = await UserPlatform.findOne({
                where: {
                    user_id: user.id,
                    app_slug: app_slug,
                    platform_type: platform_type || 'web',
                    provider: provider || 'local'
                }
            });

            if (!userPlatform) {
                return done(null, false, { message: 'User does not have access to this application' });
            }
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google OAuth Strategy - COMMENTED OUT (Using token-based verification instead)
// If you need the traditional OAuth redirect flow, uncomment this section
/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;
        const { UserPlatform } = require('../models');

        // 1. Check if we have a platform entry for this Google ID
        let platform = await UserPlatform.findOne({ 
            where: { 
                provider: 'google', 
                provider_user_id: id 
            },
            include: [{ model: User }]
        });

        if (platform && platform.User) {
            return done(null, platform.User);
        }

        // 2. Check if user exists with same email (linking account)
        let user = await User.findOne({ where: { email } });

        if (user) {
            // Link new Google identity to existing user
            await UserPlatform.create({
                user_id: user.id,
                platform_type: 'auth_provider',
                provider: 'google',
                provider_user_id: id,
                meta_data: { 
                    verified: true,
                    displayName
                }
            });
            return done(null, user);
        }

        // 3. Create new user and platform
        user = await User.create({
            username: displayName,
            email: email,
            password: null, // No password for OAuth
            is_active: true
        });

        await UserPlatform.create({
            user_id: user.id,
            platform_type: 'auth_provider',
            provider: 'google',
            provider_user_id: id,
            meta_data: { 
                verified: true,
                displayName
            }
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));
*/

module.exports = passport;
