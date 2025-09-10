import express from 'express';
import cors from 'cors';
import { testConnection, disconnect } from './config/database.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumenta limite para webhooks

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend da Plataforma de Crowdfunding',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar a conexão com o banco
app.get('/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar conexão com banco de dados',
      error: error.message
    });
  }
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Inicia o servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check disponível em: http://localhost:${PORT}/health`);
  
  // Testa a conexão com o banco na inicialização
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await disconnect();
  process.exit(0);
});
