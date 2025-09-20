import { prisma } from '../infrastructure/prisma';
import { AppError } from '../utils/AppError';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

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
      console.error('Erro ao criar diretório de uploads:', error);
    }
  }

  async uploadImages(projectId: string, files: UploadedImageFile[]): Promise<any[]> {
    console.log('📸 Iniciando upload de imagens para projeto:', projectId);
    console.log('📁 Diretório de upload:', this.uploadDir);
    console.log('📊 Número de arquivos:', files.length);

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, deletedAt: true }
    });

    if (!project || project.deletedAt) {
      throw new AppError('Project not found', 404);
    }

    console.log('✅ Projeto encontrado:', project.id);

    // Verificar limite de imagens (máximo 5)
    const existingImagesCount = await prisma.projectImage.count({
      where: { projectId }
    });

    if (existingImagesCount + files.length > 5) {
      throw new AppError('Maximum 5 images allowed per project', 400);
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file) {
        throw new AppError('Invalid file provided', 400);
      }
      
      console.log(`📄 Processando arquivo ${i + 1}:`, file.originalname);
      
      // Validar tipo de arquivo
      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(`File ${file.originalname} is not a valid image`, 400);
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError(`File ${file.originalname} exceeds 5MB limit`, 400);
      }

      console.log(`✅ Validações OK para ${file.originalname}`);

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const filename = `${projectId}-${Date.now()}-${i}${fileExtension}`;
      const filepath = path.join(this.uploadDir, filename);

      console.log(`💾 Salvando arquivo em:`, filepath);

      // Salvar arquivo no disco
      try {
        await writeFile(filepath, file.buffer);
        console.log(`✅ Arquivo salvo: ${filename}`);
      } catch (writeError) {
        console.error(`❌ Erro ao salvar arquivo ${filename}:`, writeError);
        throw new AppError(`Failed to save file ${file.originalname}`, 500);
      }

      // URL pública da imagem
      const url = `/uploads/projects/${filename}`;

      // Salvar no banco de dados
      console.log(`💾 Salvando no banco de dados: ${filename}`);
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

        console.log(`✅ Imagem salva no banco: ${projectImage.id}`);
        uploadedImages.push(projectImage);
      } catch (dbError) {
        console.error(`❌ Erro ao salvar no banco de dados:`, dbError);
        throw new AppError(`Failed to save image metadata for ${file.originalname}`, 500);
      }
    }

    console.log(`🎉 Upload concluído! ${uploadedImages.length} imagens processadas.`);
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

    // Remover arquivo do disco
    const filepath = path.join(this.uploadDir, image.filename);
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      // Continua mesmo se não conseguir remover o arquivo
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

    // Remover arquivos do disco
    for (const image of images) {
      const filepath = path.join(this.uploadDir, image.filename);
      try {
        await unlink(filepath);
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }

    // Remover do banco de dados
    await prisma.projectImage.deleteMany({
      where: { projectId }
    });
  }
}
