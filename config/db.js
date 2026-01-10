const { Sequelize } = require('sequelize');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:admin@localhost:5432/AuthService';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected via Sequelize');

    await sequelize.sync({ alter: true });
    console.log('✅ Database Synced');
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
