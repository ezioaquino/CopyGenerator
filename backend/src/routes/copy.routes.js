import { Router } from 'express';
import * as copyController from '../controllers/copy.controller.js';
import { validateGenerateCopy, validateUpdateCopy } from '../middleware/validation.js';
import { generateLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Aplica o limitador geral para todas as rotas da API
router.use(apiLimiter);

// Rota para buscar estatísticas agregadas (deve vir antes de rotas dinâmicas como /:id)
router.get('/stats', copyController.getStats);

// Rota para gerar copy - aplica o limitador estrito de IA e a validação de campos
router.post('/generate', generateLimiter, validateGenerateCopy, copyController.generate);

// Rotas para manipular o histórico no banco de dados
router.get('/', copyController.list);
router.patch('/:id/favorite', copyController.toggleFavorite);
router.put('/:id', validateUpdateCopy, copyController.update);
router.delete('/:id', copyController.deleteCopy);

export default router;
