import { Router } from 'express';
import devRoutes from './dev';

const router = Router();

// Health check and development routes
router.use('/dev', devRoutes);

// API routes will be added here
// router.use('/api/campaigns', campaignRoutes);
// router.use('/api/users', userRoutes);
// router.use('/api/support', supportRoutes);

export default router;
