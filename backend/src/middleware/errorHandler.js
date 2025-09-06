const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('Error:', err);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    const message = 'Recurso duplicado';
    error = { message, statusCode: 400 };
  }

  // Erro de registro não encontrado no Prisma
  if (err.code === 'P2025') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  // Erro de validação do Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    const message = err.errors.map(e => e.msg).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    const message = 'Token inválido ou expirado';
    error = { message, statusCode: 401 };
  }

  // Erro de autorização
  if (err.name === 'ForbiddenError') {
    const message = 'Acesso negado';
    error = { message, statusCode: 403 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
