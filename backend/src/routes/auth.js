const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Rota para obter perfil do usuário autenticado
router.get('/me', authMiddleware, userController.getProfile);

// Rota para atualizar perfil do usuário
router.put('/me', authMiddleware, userController.updateProfile);

// Rota para obter estatísticas do usuário
router.get('/me/stats', authMiddleware, userController.getUserStats);

module.exports = router;
