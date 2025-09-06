import { Router } from 'express';
import {
  generateQRCode,
  confirmPayment,
  getPaymentStatus
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Protected routes
router.post('/qr-code', authMiddleware, generateQRCode);
router.post('/confirm', authMiddleware, confirmPayment);
router.get('/status/:paymentId', authMiddleware, getPaymentStatus);

export default router;
