import { Router } from 'express';
import devRoutes from './dev';
import campaignRoutes from './campaigns';
import supportRoutes from './supports';
import commentRoutes from './comments';
import userRoutes from './users';
import paymentRoutes from './payments';

const router = Router();

// Health check and development routes
router.use('/dev', devRoutes);

// API routes
router.use('/api/campaigns', campaignRoutes);
router.use('/api/supports', supportRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/users', userRoutes);
router.use('/api/payments', paymentRoutes);

export default router;
