const { body, validationResult } = require('express-validator');

// Validação para criação de campanha
const validateCampaign = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('goal')
    .isFloat({ min: 1 })
    .withMessage('Meta deve ser um valor maior que 0'),
  
  body('deadline')
    .isISO8601()
    .withMessage('Data de prazo deve ser válida')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      if (deadline <= now) {
        throw new Error('Prazo deve ser uma data futura');
      }
      return true;
    }),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem deve ser válida')
];

// Validação para criação de doação
const validateDonation = [
  body('campaignId')
    .isUUID()
    .withMessage('ID da campanha deve ser válido'),
  
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Valor da doação deve ser maior que 0')
];

// Validação para atualização de perfil
const validateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem deve ser válida')
];

// Validação para comentários
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comentário deve ter entre 1 e 500 caracteres')
];

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCampaign,
  validateDonation,
  validateProfile,
  validateComment,
  handleValidationErrors
};
