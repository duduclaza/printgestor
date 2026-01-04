import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import './models/index.js';
import clientesRoutes from './routes/clientes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/clientes', clientesRoutes);

app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running!', status: 'OK' });
});

// Serve static files from frontend build (production)
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA - for any non-API route, serve index.html
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Database Sync and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync({ force: false, alter: true });
        console.log('Database synchronized. Tables created/updated.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
