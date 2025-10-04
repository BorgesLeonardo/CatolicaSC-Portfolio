import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  redact: {
    paths: ['req.headers.authorization', 'headers.authorization', 'authorization', 'token', 'password'],
    remove: true,
  },
});

export function logWithdrawalEvent(withdrawalId: string, fields: Record<string, unknown>) {
  logger.info({ withdrawalId, ...fields }, 'withdrawal_event');
}

export function withRequest<T extends Record<string, unknown>>(fields: T) {
  return logger.child(fields);
}


