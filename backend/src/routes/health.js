const express = require('express');
const database = require('../config/database');

const router = express.Router();

// Health check básico
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check completo com banco de dados
router.get('/detailed', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.json({
      success: true,
      message: 'Health check detalhado',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check falhou',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
