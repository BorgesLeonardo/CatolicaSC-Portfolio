import rateLimit from 'express-rate-limit';

// Global API rate limiter
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 300, // max requests per window per IP/user
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).authUserId || req.ip,
	message: {
		error: 'TooManyRequests',
		message: 'Muitas requisições. Tente novamente em alguns minutos.'
	},
});

export const createProjectLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Muitas tentativas. Tente novamente mais tarde.',
  },
});


export const createWithdrawalLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  keyGenerator: (req) => (req as any).authUserId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Limite de criação de retirada atingido. Tente novamente mais tarde.',
  },
});


