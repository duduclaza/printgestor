import express from 'express';
import { Cliente } from '../models/index.js';

const router = express.Router();

// GET all clients
router.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single client by ID
router.get('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new client
router.post('/', async (req, res) => {
    try {
        const cliente = await Cliente.create(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update client
router.put('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        await cliente.update(req.body);
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE client
router.delete('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        await cliente.destroy();
        res.json({ message: 'Cliente excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
