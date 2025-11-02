import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { ProjectVideosController } from '../controllers/project-videos.controller';

const router = Router();
const controller = new ProjectVideosController();

// Generate presigned URL for direct upload (if enabled)
router.post(
  '/:projectId/video/presign',
  requireApiAuth,
  controller.presignVideo.bind(controller)
);

// Finalize: link uploaded video URL to project
router.post(
  '/:projectId/video/finalize',
  requireApiAuth,
  controller.finalizeVideo.bind(controller)
);

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


