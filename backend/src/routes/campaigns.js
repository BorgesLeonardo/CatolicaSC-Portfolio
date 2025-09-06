const express = require('express');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const campaignController = require('../controllers/campaignController');
const { validateCampaign } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas
router.get('/', optionalAuth, campaignController.getAllCampaigns);
router.get('/:id', optionalAuth, campaignController.getCampaignById);
router.get('/:id/comments', optionalAuth, campaignController.getCampaignComments);

// Rotas protegidas
router.post('/', authMiddleware, validateCampaign, campaignController.createCampaign);
router.put('/:id', authMiddleware, campaignController.updateCampaign);
router.delete('/:id', authMiddleware, campaignController.deleteCampaign);
router.post('/:id/comments', authMiddleware, campaignController.addComment);

module.exports = router;
