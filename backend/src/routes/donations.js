const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const donationController = require('../controllers/donationController');
const { validateDonation } = require('../middleware/validation');

const router = express.Router();

// Todas as rotas de doação requerem autenticação
router.use(authMiddleware);

// Criar nova doação
router.post('/', validateDonation, donationController.createDonation);

// Obter doações do usuário
router.get('/my', donationController.getMyDonations);

// Obter doações de uma campanha específica
router.get('/campaign/:campaignId', donationController.getCampaignDonations);

// Confirmar pagamento (webhook do Mercado Pago)
router.post('/webhook', donationController.handlePaymentWebhook);

module.exports = router;
