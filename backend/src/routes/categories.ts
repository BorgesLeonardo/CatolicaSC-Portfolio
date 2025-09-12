import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';

const router = Router();
const categoriesController = new CategoriesController();

// GET /api/categories - Lista todas as categorias ativas
router.get('/', categoriesController.list.bind(categoriesController));

// GET /api/categories/:id - Busca categoria por ID
router.get('/:id', categoriesController.getById.bind(categoriesController));

export default router;
