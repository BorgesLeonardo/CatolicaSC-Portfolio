import { Router } from 'express';
import { requireApiAuth } from '../middleware/auth';
import { ProjectImagesController } from '../controllers/project-images.controller';

const router = Router();
const projectImagesController = new ProjectImagesController();

/** ---------- Upload de imagens (privado) ---------- */
router.post(
  '/:projectId/images', 
  requireApiAuth,
  projectImagesController.uploadMiddleware,
  projectImagesController.uploadImages.bind(projectImagesController)
);

/** ---------- Listar imagens do projeto (público) ---------- */
router.get(
  '/:projectId/images',
  projectImagesController.getProjectImages.bind(projectImagesController)
);

/** ---------- Deletar imagem (privado) ---------- */
router.delete(
  '/:projectId/images/:imageId',
  requireApiAuth,
  projectImagesController.deleteImage.bind(projectImagesController)
);

/** ---------- Reordenar imagens (privado) ---------- */
router.put(
  '/:projectId/images/reorder',
  requireApiAuth,
  projectImagesController.reorderImages.bind(projectImagesController)
);

export default router;
