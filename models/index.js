const User = require('./User');
const UserPlatform = require('./UserPlatform');

// Associations
User.hasMany(UserPlatform, { foreignKey: 'user_id', as: 'platforms' });
UserPlatform.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    User,
    UserPlatform,
};
