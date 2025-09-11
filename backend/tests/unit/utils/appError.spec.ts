import { AppError, createError } from '../../../src/utils/AppError';

describe('AppError', () => {
  it('cria erro com status e detalhes', () => {
    const err = new AppError('Falha', 400, { field: 'name' });
    expect(err.message).toBe('Falha');
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'name' });
  });

  it('cria erro com status padrão 500', () => {
    const err = new AppError('Erro interno');
    expect(err.message).toBe('Erro interno');
    expect(err.statusCode).toBe(500);
    expect(err.details).toBeUndefined();
  });

  it('cria erro sem detalhes', () => {
    const err = new AppError('Not Found', 404);
    expect(err.message).toBe('Not Found');
    expect(err.statusCode).toBe(404);
    expect(err.details).toBeUndefined();
  });

  it('é uma instância de Error', () => {
    const err = new AppError('Teste', 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('mantém stack trace', () => {
    const err = new AppError('Teste', 400);
    expect(err.stack).toBeDefined();
    expect(err.constructor.name).toBe('AppError');
  });
});

describe('createError', () => {
  it('cria AppError com parâmetros', () => {
    const err = createError('Erro de validação', 422, { field: 'email' });
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Erro de validação');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ field: 'email' });
  });

  it('usa valores padrão', () => {
    const err = createError('Erro interno');
    expect(err.message).toBe('Erro interno');
    expect(err.statusCode).toBe(500);
    expect(err.details).toBeUndefined();
  });
});
