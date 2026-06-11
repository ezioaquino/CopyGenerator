import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import copyRoutes from './routes/copy.routes.js';
import errorHandler from './middleware/error.js';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de Segurança e Auxiliares
app.use(helmet()); // Protege cabeçalhos HTTP
app.use(cors({
  // Em produção, defina CORS_ORIGIN no .env com o domínio exato do frontend (ex: https://meufrontend.com)
  // Em desenvolvimento, aceita qualquer origem ('*') para facilitar os testes locais
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // Logger de requisições HTTP no console
app.use(express.json()); // Parser para requisições JSON

// Rota padrão para verificação de funcionamento (Health Check)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API do Gerador de Copy com IA está ativa e funcionando!',
    endpoints: {
      stats: 'GET /api/copies/stats',
      list: 'GET /api/copies',
      generate: 'POST /api/copies/generate',
      favorite: 'PATCH /api/copies/:id/favorite',
      update: 'PUT /api/copies/:id',
      delete: 'DELETE /api/copies/:id'
    }
  });
});

// Registra as rotas da API
app.use('/api/copies', copyRoutes);

// Middleware de tratamento global de erros (deve ser o último registrado)
app.use(errorHandler);

// Inicializa o servidor Express
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});
