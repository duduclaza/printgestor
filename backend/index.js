import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/index.js'; // Import models to ensure they are registered

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running!', status: 'OK' });
});

// Database Sync and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync all models (create tables if they don't exist)
        // force: false ensures we don't drop existing tables
        // alter: true updates tables if models change (use with caution in production)
        await sequelize.sync({ force: false, alter: true });
        console.log('Database synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
