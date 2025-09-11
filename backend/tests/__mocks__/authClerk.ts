export const requireAuth = (req: any, _res: any, next: any) => {
  // Simula usuário autenticado
  req.authUserId = 'user_test_123';
  req.authRole = 'user';
  next();
};

export const requireApiAuth = (req: any, _res: any, next: any) => {
  // Simula usuário autenticado
  req.authUserId = 'user_test_123';
  req.authRole = 'user';
  next();
};

export const getAuth = jest.fn(() => ({
  userId: 'user_test_123',
  sessionId: 'sess_test_123',
  orgId: null,
  orgRole: null,
  orgSlug: null,
}));

// Mock para simular usuário não autenticado
export const mockUnauthenticated = () => {
  getAuth.mockReturnValueOnce({
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
  });
};

// Mock para simular usuário admin
export const mockAdminUser = () => {
  getAuth.mockReturnValueOnce({
    userId: 'admin_test_123',
    sessionId: 'sess_admin_123',
    orgId: null,
    orgRole: null,
    orgSlug: null,
  });
};

export default { requireAuth, requireApiAuth, getAuth, mockUnauthenticated, mockAdminUser };
