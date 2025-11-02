import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import { getPresignedPutUrl, getPublicBaseUrl, isS3Enabled } from '../lib/storage';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const exists = (p: string) => new Promise<boolean>(resolve => fs.access(p, fs.constants.F_OK, err => resolve(!err)));

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

  private getUploadDir(): string {
    return path.join(process.cwd(), 'uploads', 'projects', 'videos');
  }

  // POST /api/:projectId/video/presign
  async presignVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isS3Enabled()) {
        return res.status(501).json({ message: 'Presigned uploads not enabled' });
      }

      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const bodySchema = z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
        size: z.number().int().positive().max(100 * 1024 * 1024)
      });
      const body = bodySchema.parse(req.body);

      const userId: string = (req as any).authUserId;
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true }
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      const ext = path.extname(body.filename) || '.mp4';
      const key = `projects/videos/${params.data.projectId}-${Date.now()}${ext}`;
      const uploadUrl = await getPresignedPutUrl({ key, contentType: body.contentType });
      const base = getPublicBaseUrl() as string;
      const publicUrl = `${base}/${key}`;

      return res.status(200).json({ uploadUrl, key, publicUrl });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/:projectId/video/finalize
  async finalizeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const bodySchema = z.object({
        publicUrl: z.string().url(),
      });
      const body = bodySchema.parse(req.body);

      const userId: string = (req as any).authUserId;
      const project = await prisma.project.findUnique({
        where: { id: params.data.projectId },
        select: { ownerId: true, deletedAt: true, videoUrl: true },
      });
      if (!project || project.deletedAt) throw new AppError('Project not found', 404);
      if (project.ownerId !== userId) throw new AppError('Forbidden', 403);

      const updated = await prisma.project.update({
        where: { id: params.data.projectId },
        data: { videoUrl: body.publicUrl },
        select: { id: true, videoUrl: true },
      });
      return res.status(200).json({ message: 'Video linked', videoUrl: updated.videoUrl });
    } catch (error) {
      return next(error);
    }
  }

  private async ensureUploadDir(): Promise<void> {
    const dir = this.getUploadDir();
    if (!(await exists(dir))) {
      await mkdir(dir, { recursive: true });
    }
  }

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

      await this.ensureUploadDir();
      const ext = path.extname(file.originalname) || '.mp4';
      const filename = `${params.data.projectId}-${Date.now()}${ext}`;
      const filepath = path.join(this.getUploadDir(), filename);
      await writeFile(filepath, file.buffer);

      // Remove old video file if local
      if (project.videoUrl && project.videoUrl.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), project.videoUrl.replace(/^\//, ''));
        try { await unlink(oldPath); } catch {}
      }

      const publicUrl = `/uploads/projects/videos/${filename}`;
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

      if (project.videoUrl && project.videoUrl.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), project.videoUrl.replace(/^\//, ''));
        try { await unlink(oldPath); } catch {}
      }

      await prisma.project.update({ where: { id: params.data.projectId }, data: { videoUrl: null } });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}


