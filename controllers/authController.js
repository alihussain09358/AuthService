const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User
exports.register = async (req, res) => {
    const { username, email, password, app_slug, platform_type, provider, provider_user_id } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Create UserPlatform for Local Auth
        const { UserPlatform } = require('../models');
        await UserPlatform.create({
            user_id: user.id,
            platform_type: platform_type || 'web',
            provider: provider || 'local',
            provider_user_id: provider_user_id || user.id.toString(), // For local, it maps to self
            app_slug: app_slug || 'default-api'
        });

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login User
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json(info);

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            const { app_slug, platform_type, provider } = req.body;
            
            // Generate Token with app_slug included
            const payload = {
                user: {
                    id: user.id
                },
                app_slug: app_slug || null,
                platform_type: platform_type || 'web',
                provider: provider || 'local'
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        });
    })(req, res, next);
};

// Validate Token
exports.validateToken = (req, res) => {
    // If the middleware passed, the token is valid and req.user is set
    res.json({ valid: true, user: req.user });
};

// Google Authentication (Token-based)
exports.googleAuth = async (req, res) => {
    const { credential, app_slug, platform_type, provider } = req.body;

    try {
        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ msg: 'Email not provided by Google' });
        }

        const { UserPlatform } = require('../models');

        // Find or create user
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new user
            user = await User.create({
                username: name || email.split('@')[0],
                email,
                password: null, // No password for OAuth users
                is_active: true
            });
        }

        // Check if UserPlatform entry exists for this Google account
        let userPlatform = await UserPlatform.findOne({
            where: {
                user_id: user.id,
                provider: provider || 'google',
                provider_user_id: googleId
            }
        });

        if (!userPlatform) {
            // Create UserPlatform entry for Google provider
            userPlatform = await UserPlatform.create({
                user_id: user.id,
                platform_type: 'auth_provider',
                provider: provider || 'google',
                provider_user_id: googleId,
                meta_data: {
                    verified: true,
                    displayName: name,
                    picture
                }
            });
        }

        // If app_slug is provided, create/update UserPlatform entry for this app
        if (app_slug) {
            const existingAppAccess = await UserPlatform.findOne({
                where: {
                    user_id: user.id,
                    app_slug: app_slug,
                    platform_type: platform_type || 'web',
                    provider: provider || 'google'
                }
            });

            if (!existingAppAccess) {
                // Create UserPlatform entry for this app
                await UserPlatform.create({
                    user_id: user.id,
                    app_slug: app_slug,
                    platform_type: platform_type || 'web',
                    provider: provider || 'google',
                    provider_user_id: googleId,
                    meta_data: {
                        lastLogin: new Date()
                    }
                });
            } else {
                // Update last login time
                await existingAppAccess.update({
                    meta_data: {
                        ...existingAppAccess.meta_data,
                        lastLogin: new Date()
                    }
                });
            }
        }

        // Generate JWT token with app_slug included
        // This ensures tokens are app-specific and can't be used across different apps
        const jwtPayload = {
            user: {
                id: user.id,
                email: user.email,
                name: user.username
            },
            app_slug: app_slug || null,
            platform_type: platform_type || 'web',
            provider: provider || 'google'
        };

        jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.username,
                        picture
                    }
                });
            }
        );
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ 
            success: false, 
            msg: 'Invalid Google token' 
        });
    }
};
