const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPlatform = sequelize.define(
  'UserPlatform',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    // e.g. "auth_provider" (google, facebook) or "application" (mobile_app, web_dashboard)
    platform_type: {
      type: DataTypes.ENUM('web', 'mobile'),
      allowNull: false,
      defaultValue: 'web',
    },

    // The specific provider/source name: "google", "github", "internal_crm"
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Unique ID from the provider (e.g. Google sub, or just user_id for internal apps)
    provider_user_id: {
      type: DataTypes.STRING,
      allowNull: true, // Might be null for general app access tracking
    },

    // Context tag, e.g. "marketing-portal", "android-app"
    app_slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    meta_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'user_platforms',
    underscored: true,
    indexes: [
      {
        // One user can only have one identity per provider/slug combo? 
        // Or just index for lookup. Let's enforce uniqueness where it makes sense.
        // For auth providers: (provider, provider_user_id) should be unique globally maybe?
        // But for linking to a user: (user_id, provider, app_slug)
        unique: false,
        fields: ['user_id', 'provider', 'app_slug'],
      },
      {
        // Lookup by provider ID (e.g. login with Google)
        fields: ['provider', 'provider_user_id'],
      },
    ],
  }
);

module.exports = UserPlatform;
