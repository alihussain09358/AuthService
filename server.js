const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();

const app = express();

const session = require('express-session');
const passport = require('./config/passport');
const morgan = require('morgan');

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Health Check
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({ status: 'OK', database: 'Connected' });
    } catch (error) {
        res.status(503).json({ status: 'Error', database: 'Disconnected', error: error.message });
    }
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
