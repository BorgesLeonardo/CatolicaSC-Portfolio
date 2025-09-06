import { Router } from 'express';
import { getDevStatus } from '../controllers/devController';

const router = Router();

router.get('/', getDevStatus);

export default router;
