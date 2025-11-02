import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectImagesService } from '../services/project-images.service';
import { AppError } from '../utils/AppError';
import { prisma } from '../infrastructure/prisma';
import multer from 'multer';
import { getPresignedPutUrl, getPublicBaseUrl, isS3Enabled } from '../lib/storage';

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

  // POST /api/:projectId/images/presign
  async presignImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isS3Enabled()) {
        return res.status(501).json({ message: 'Presigned uploads not enabled' });
      }

      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const bodySchema = z.object({
        files: z.array(z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          size: z.number().int().positive().max(5 * 1024 * 1024)
        })).min(1).max(5)
      });
      const body = bodySchema.parse(req.body);

      const userId: string = (req as any).authUserId;
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true }
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      const base = getPublicBaseUrl() as string;
      const results: { uploadUrl: string; key: string; publicUrl: string }[] = [];
      for (const f of body.files) {
        const ext = (f.filename.match(/\.[^.]+$/)?.[0]) || '';
        const key = `projects/${params.data.projectId}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const uploadUrl = await getPresignedPutUrl({ key, contentType: f.contentType });
        const publicUrl = `${base}/${key}`;
        results.push({ uploadUrl, key, publicUrl });
      }
      return res.status(200).json({ items: results });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/:projectId/images/finalize
  async finalizeImages(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const bodySchema = z.object({
        images: z.array(z.object({
          publicUrl: z.string().url(),
          originalName: z.string().min(1),
          size: z.number().int().positive().max(5 * 1024 * 1024),
          mimeType: z.string().min(1)
        })).min(1).max(5)
      });
      const body = bodySchema.parse(req.body);

      const userId: string = (req as any).authUserId;
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true }
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      const existingCount = await prisma.projectImage.count({ where: { projectId: params.data.projectId } });
      let order = existingCount;
      const created = [] as any[];
      for (const img of body.images) {
        const filename = img.publicUrl.split('/').pop() || img.originalName;
        const rec = await prisma.projectImage.create({
          data: {
            projectId: params.data.projectId,
            filename,
            originalName: img.originalName,
            url: img.publicUrl,
            size: img.size,
            mimeType: img.mimeType,
            order: order++
          }
        });
        created.push(rec);
      }
      return res.status(201).json({ message: 'Images linked', images: created });
    } catch (error) {
      return next(error);
    }
  }

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
