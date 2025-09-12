import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CategoriesService } from '../services/categories.service';
import { AppError } from '../utils/AppError';

// Injeção de dependência para testes
const categoriesService = (global as any).__CATEGORIES_SERVICE__ || new CategoriesService();

export class CategoriesController {
  constructor(private service: CategoriesService = categoriesService) {}

  // Schema de validação para ID
  private idParamSchema = z.object({
    id: z.string().cuid({ message: 'id inválido' }),
  });

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.service.list();
      return res.json(categories);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = this.idParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError('ValidationError', 400, params.error.flatten());
      }

      const category = await this.service.getById(params.data.id);
      
      if (!category) {
        throw new AppError('Category not found', 404);
      }

      return res.json(category);
    } catch (error) {
      return next(error);
    }
  }
}
