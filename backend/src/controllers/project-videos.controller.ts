import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3, getBucketName, buildPublicUrl, tryExtractKeyFromUrl } from '../lib/s3';
import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';

const unlink = promisify(fs.unlink);

// Multer config: single video up to 100MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true); else cb(new Error('Only video files are allowed'));
  },
});

export class ProjectVideosController {
  public uploadMiddleware = upload.single('video');

  private idParamSchema = z.object({
    projectId: z.string().cuid({ message: 'Project ID inválido' }),
  });

  async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const userId: string = (req as any).authUserId;

      // Ownership check
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true, videoUrl: true },
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      const file = req.file as Express.Multer.File | undefined;
      if (!file) throw new AppError('No video provided', 400);
      if (!file.mimetype.startsWith('video/')) throw new AppError('Invalid video type', 400);
      if (file.size > 100 * 1024 * 1024) throw new AppError('Video exceeds 100MB limit', 400);

      // Upload para S3
      const ext = path.extname(file.originalname) || '.mp4';
      const filename = `${params.data.projectId}-${Date.now()}${ext}`;
      const key = `projects/${params.data.projectId}/videos/${filename}`;
      await s3.send(new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000'
      }));

      // Remover vídeo anterior do storage quando possível
      try {
        const prevKey = tryExtractKeyFromUrl(project.videoUrl);
        if (prevKey) {
          await s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: prevKey }));
        } else if (project.videoUrl && project.videoUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), project.videoUrl.replace(/^\//, ''));
          try { await unlink(oldPath); } catch {}
        }
      } catch {}

      const publicUrl = buildPublicUrl(key);
      const updated = await prisma.project.update({
        where: { id: params.data.projectId },
        data: { videoUrl: publicUrl },
        select: { id: true, videoUrl: true },
      });

      return res.status(201).json({ message: 'Video uploaded successfully', videoUrl: updated.videoUrl });
    } catch (error) {
      return next(error);
    }
  }

  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const userId: string = (req as any).authUserId;
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true, videoUrl: true },
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      try {
        const prevKey = tryExtractKeyFromUrl(project.videoUrl);
        if (prevKey) {
          await s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: prevKey }));
        } else if (project.videoUrl && project.videoUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), project.videoUrl.replace(/^\//, ''));
          try { await unlink(oldPath); } catch {}
        }
      } catch {}

      await prisma.project.update({ where: { id: params.data.projectId }, data: { videoUrl: null } });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}


