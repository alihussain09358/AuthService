const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Get current user profile
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: ['platforms']
        });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const userFields = {};
    if (username) userFields.username = username;
    if (email) userFields.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        userFields.password = await bcrypt.hash(password, salt);
    }

    try {
        let user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        await User.update(userFields, {
            where: { id: req.user.id }
        });

        user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.user.id } });
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
