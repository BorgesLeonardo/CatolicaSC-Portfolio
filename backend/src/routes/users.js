const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware);

// Obter perfil do usuário
router.get('/profile', userController.getProfile);

// Atualizar perfil do usuário
router.put('/profile', userController.updateProfile);

// Obter campanhas do usuário
router.get('/campaigns', userController.getUserCampaigns);

// Obter doações do usuário
router.get('/donations', userController.getUserDonations);

// Obter estatísticas do usuário
router.get('/stats', userController.getUserStats);

module.exports = router;
