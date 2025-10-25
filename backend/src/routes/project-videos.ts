import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { ProjectVideosController } from '../controllers/project-videos.controller';

const router = Router();
const controller = new ProjectVideosController();

// Upload single video
router.post(
  '/:projectId/video',
  requireApiAuth,
  controller.uploadMiddleware,
  controller.uploadVideo.bind(controller)
);

// Delete video
router.delete(
  '/:projectId/video',
  requireApiAuth,
  controller.deleteVideo.bind(controller)
);

export default router;


