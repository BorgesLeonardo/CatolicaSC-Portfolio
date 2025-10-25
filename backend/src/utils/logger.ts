import pino from 'pino';
import { maskEmail, maskCpfCnpj } from './sanitize';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: null,
  redact: {
		paths: [
			'req.headers.authorization',
			'req.headers.cookie',
			'headers.authorization',
			'headers.cookie',
			'authorization',
			'cookie',
			'set-cookie',
			'req.headers.stripe-signature',
			'stripe-signature',
			'req.body.password',
			'req.body.currentPassword',
			'req.body.newPassword',
			'req.body.token',
			'req.body.accessToken',
			'req.body.refreshToken',
			'req.body.idToken',
			'req.body.secret',
			'req.body.clientSecret',
			'req.query.token',
			'req.query.accessToken',
			'req.query.refreshToken',
			'req.query.idToken',
			'req.query.secret',
		],
    remove: true,
  },
});

export function logWithdrawalEvent(withdrawalId: string, fields: Record<string, unknown>) {
  const masked: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && k.toLowerCase().includes('email')) {
      masked[k] = maskEmail(v);
    } else if (typeof v === 'string' && (k.toLowerCase().includes('cpf') || k.toLowerCase().includes('cnpj'))) {
      masked[k] = maskCpfCnpj(v);
    } else {
      masked[k] = v;
    }
  }
  logger.info({ withdrawalId, ...masked }, 'withdrawal_event');
}

export function withRequest<T extends Record<string, unknown>>(fields: T) {
  return logger.child(fields);
}


