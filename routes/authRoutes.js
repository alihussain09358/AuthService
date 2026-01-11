const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const passport = require('passport');
const { register, login, validateToken, googleAuth } = require('../controllers/authController');
const { registerSchema, loginSchema, googleAuthSchema } = require('../schemas/authSchemas');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validate(registerSchema), register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   POST api/auth/google
// @desc    Google token-based authentication
// @access  Public
router.post('/google', validate(googleAuthSchema), googleAuth);

// @route   GET api/auth/validate
// @desc    Validate access token
// @access  Private
router.get('/validate', auth, validateToken);

module.exports = router;
