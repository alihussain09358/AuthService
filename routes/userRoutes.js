const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUser, updateUser, deleteUser } = require('../controllers/userController');

// @route   GET api/users
// @desc    Get user profile
// @access  Private
router.get('/', auth, getUser);

// @route   PUT api/users
// @desc    Update user profile
// @access  Private
router.put('/', auth, updateUser);

// @route   DELETE api/users
// @desc    Delete user
// @access  Private
router.delete('/', auth, deleteUser);

module.exports = router;
