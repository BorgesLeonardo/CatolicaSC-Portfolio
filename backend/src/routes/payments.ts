import { Router } from 'express';
import {
  generateQRCode,
  confirmPayment,
  getPaymentStatus,
  createPayment,
  handleWebhook,
  getPaymentStatusFromMP
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';
import { paymentRateLimit, authRateLimit } from '../middlewares/security';
import { 
  validatePayment, 
  validateMercadoPagoPayment, 
  validateId 
} from '../middlewares/validation';

const router = Router();

// Protected routes with rate limiting and validation
router.post('/qr-code', authRateLimit, authMiddleware, validatePayment, generateQRCode);
router.post('/confirm', authRateLimit, authMiddleware, confirmPayment);
router.get('/status/:paymentId', authMiddleware, validateId, getPaymentStatus);

// Mercado Pago integration routes with payment rate limiting
router.post('/create', paymentRateLimit, authMiddleware, validateMercadoPagoPayment, createPayment);
router.get('/mp-status/:paymentId', authMiddleware, validateId, getPaymentStatusFromMP);

// Webhook route (no auth required, but with rate limiting)
router.post('/webhook', paymentRateLimit, handleWebhook);

export default router;
