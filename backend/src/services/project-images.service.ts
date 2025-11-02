import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3, getBucketName, buildPublicUrl, tryExtractKeyFromUrl } from '../lib/s3';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export interface CreateProjectImageData {
  projectId: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  order?: number;
}

export interface UploadedImageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export class ProjectImagesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'projects');

  constructor() {
    // Garantir que o diretório de upload existe (síncronamente)
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (error) {
      // noop: removed debug log
    }
  }

  async uploadImages(projectId: string, files: UploadedImageFile[]): Promise<any[]> {
    // noop: removed debug log

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, deletedAt: true }
    });

    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    // noop: removed debug log

    // Verificar limite de imagens (máximo 5)
    const existingImagesCount = await prisma.projectImage.count({
      where: { projectId }
    });

    if (existingImagesCount + files.length > 5) {
      throw new AppError('Maximum 5 images allowed per project', 400);
    }

    const uploadedImages: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file) {
        throw new AppError('Invalid file provided', 400);
      }
      
      // noop: removed debug log
      
      // Validar tipo de arquivo
      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(`File ${file.originalname} is not a valid image`, 400);
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError(`File ${file.originalname} exceeds 5MB limit`, 400);
      }

      // noop: removed debug log

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname) || '.jpg';
      const filename = `${projectId}-${Date.now()}-${i}${fileExtension}`;

      // Upload para S3
      const key = `projects/${projectId}/images/${filename}`;
      try {
        await s3.send(new PutObjectCommand({
          Bucket: getBucketName(),
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable'
        }));
      } catch (err) {
        throw new AppError(`Failed to upload image ${file.originalname}`, 500);
      }

      // URL pública (CloudFront/Custom ou S3)
      const url = buildPublicUrl(key);

      // Salvar no banco de dados
      // noop: removed debug log
      try {
        const projectImage = await prisma.projectImage.create({
          data: {
            projectId,
            filename,
            originalName: file.originalname,
            url,
            size: file.size,
            mimeType: file.mimetype,
            order: existingImagesCount + i
          }
        });

        // noop: removed debug log
        uploadedImages.push(projectImage);
      } catch (dbError) {
        // noop: removed debug log
        throw new AppError(`Failed to save image metadata for ${file.originalname}`, 500);
      }
    }

    // noop: removed debug log
    return uploadedImages;
  }

  async getProjectImages(projectId: string) {
    return await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: { order: 'asc' }
    });
  }

  async deleteImage(imageId: string, projectId: string, userId: string) {
    // Verificar se o usuário é dono do projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, deletedAt: true }
    });

    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    if (project.ownerId !== userId) {
      throw new AppError('Forbidden', 403);
    }

    // Buscar a imagem
    const image = await prisma.projectImage.findUnique({
      where: { id: imageId }
    });

    if (!image || image.projectId !== projectId) {
      throw new AppError('Image not found', 404);
    }

    // Remover objeto do storage (S3) se possível
    try {
      const maybeKey = tryExtractKeyFromUrl(image.url);
      if (maybeKey) {
        await s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: maybeKey }));
      } else {
        // Backward compatibility: remove arquivo local, se existir
        const filepath = path.join(this.uploadDir, image.filename);
        try { await unlink(filepath); } catch {}
      }
    } catch {
      // noop: ignore storage deletion errors
    }

    // Remover do banco de dados
    await prisma.projectImage.delete({
      where: { id: imageId }
    });

    // Reordenar imagens restantes
    await this.reorderImages(projectId);
  }

  async reorderImages(projectId: string, imageIds?: string[]) {
    if (imageIds && imageIds.length > 0) {
      // Reordenar baseado na ordem fornecida
      for (let i = 0; i < imageIds.length; i++) {
        const imageId = imageIds[i];
        if (imageId) {
          await prisma.projectImage.update({
            where: { id: imageId },
            data: { order: i }
          });
        }
      }
    } else {
      // Reordenar sequencialmente após remoção
      const images = await prisma.projectImage.findMany({
        where: { projectId },
        orderBy: { order: 'asc' }
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image && image.order !== i) {
          await prisma.projectImage.update({
            where: { id: image.id },
            data: { order: i }
          });
        }
      }
    }
  }

  async deleteAllProjectImages(projectId: string) {
    const images = await prisma.projectImage.findMany({
      where: { projectId }
    });

    // Remover objetos do storage (S3) quando possível
    for (const image of images) {
      try {
        const maybeKey = tryExtractKeyFromUrl(image.url);
        if (maybeKey) {
          await s3.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: maybeKey }));
        } else {
          const filepath = path.join(this.uploadDir, image.filename);
          try { await unlink(filepath); } catch {}
        }
      } catch {
        // noop
      }
    }

    // Remover do banco de dados
    await prisma.projectImage.deleteMany({
      where: { projectId }
    });
  }
}
