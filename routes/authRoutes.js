const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const passport = require('passport');
const { register, login, validateToken } = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../schemas/authSchemas');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validate(registerSchema), register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   GET api/auth/google
// @desc    Google auth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect home or send token
    res.redirect('/'); 
});

// @route   GET api/auth/validate
// @desc    Validate access token
// @access  Private
router.get('/validate', auth, validateToken);

module.exports = router;
