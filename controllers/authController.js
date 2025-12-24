const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

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
            
            // Generate Token
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
        });
    })(req, res, next);
};

// Validate Token
exports.validateToken = (req, res) => {
    // If the middleware passed, the token is valid and req.user is set
    res.json({ valid: true, user: req.user });
};
