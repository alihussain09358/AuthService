const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

const passport = require('passport');
const validate = require('../middleware/validate');
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
    // For API based, we might want to return JSON with token.
    // But standard OAuth flows usually redirect. 
    // Here we'll generate a token and return it as JSON for simplicity in this hybrid approach, 
    // or redirect to a frontend with token in query param.
    // For now, let's redirect to a success page or just return JSON if it were not a browser redirect.
    // Since passport.authenticate middleware handles the request, we need custom callback if we want JSON.
    // But this is standard callback route.
    res.redirect('/'); 
});

module.exports = router;
