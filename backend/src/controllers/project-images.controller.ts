import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectImagesService } from '../services/project-images.service';
import { AppError } from '../utils/AppError';
import { prisma } from '../infrastructure/prisma';
import multer from 'multer';

const projectImagesService = new ProjectImagesService();

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // máximo 5 arquivos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class ProjectImagesController {
  constructor(private service: ProjectImagesService = projectImagesService) {}

  // Middleware do multer para upload
  public uploadMiddleware = upload.array('images', 5);

  private idParamSchema = z.object({
    projectId: z.string().cuid({ message: 'Project ID inválido' }),
  });

  private imageIdParamSchema = z.object({
    projectId: z.string().cuid({ message: 'Project ID inválido' }),
    imageId: z.string().cuid({ message: 'Image ID inválido' }),
  });

  private reorderSchema = z.object({
    imageIds: z.array(z.string().cuid()).min(1).max(5)
  });

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError('No images provided', 400);
      }

      if (files.length > 5) {
        throw new AppError('Maximum 5 images allowed', 400);
      }

      const userId: string = (req as any).authUserId;
      
      // Verificar se o usuário é dono do projeto
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true }
      });

      if (!project || project.deletedAt) {
        throw new AppError('Project not found', 404);
      }

      if (project.ownerId !== userId) {
        throw new AppError('Forbidden', 403);
      }

      // Converter para formato esperado pelo service
      const uploadFiles = files.map(file => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));

      const uploadedImages = await this.service.uploadImages(params.data.projectId, uploadFiles);
      
      return res.status(201).json({
        message: 'Images uploaded successfully',
        images: uploadedImages
      });
    } catch (error) {
      return next(error);
    }
  }

  async getProjectImages(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const images = await this.service.getProjectImages(params.data.projectId);
      
      return res.json({ images });
    } catch (error) {
      return next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.imageIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      
      await this.service.deleteImage(
        params.data.imageId, 
        params.data.projectId, 
        userId
      );
      
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async reorderImages(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const body = this.reorderSchema.safeParse(req.body);
      if (!body.success) {
        throw new AppError('ValidationError', 400, body.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      
      // Verificar se o usuário é dono do projeto
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true }
      });

      if (!project || project.deletedAt) {
        throw new AppError('Project not found', 404);
      }

      if (project.ownerId !== userId) {
        throw new AppError('Forbidden', 403);
      }

      await this.service.reorderImages(params.data.projectId, body.data.imageIds);
      
      return res.json({ message: 'Images reordered successfully' });
    } catch (error) {
      return next(error);
    }
  }
}
