import { Router } from 'express';
import {
  createUser,
  getUserProfile,
  getUserDashboard,
  updateUserProfile
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Protected routes
router.post('/', authMiddleware, createUser);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/dashboard', authMiddleware, getUserDashboard);
router.put('/profile', authMiddleware, updateUserProfile);

export default router;
