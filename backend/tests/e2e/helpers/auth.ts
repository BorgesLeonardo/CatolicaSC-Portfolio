import { Test } from 'supertest';

/**
 * Helper para adicionar headers de autenticação de teste
 */
export const withTestUser = (req: Test, userId = 'test-user-1', role = 'user'): Test => {
  return req
    .set('x-test-user-id', userId)
    .set('x-test-user-role', role);
};

/**
 * Helper para adicionar headers de admin de teste
 */
export const withTestAdmin = (req: Test, userId = 'test-admin-1'): Test => {
  return withTestUser(req, userId, 'admin');
};

/**
 * Helper para adicionar headers de usuário específico
 */
export const withTestUserCustom = (req: Test, userId: string, role = 'user'): Test => {
  return withTestUser(req, userId, role);
};

/**
 * Helper para requisições sem autenticação (para testar cenários de erro)
 */
export const withoutAuth = (req: Test): Test => {
  return req;
};
