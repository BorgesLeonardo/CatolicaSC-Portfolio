export const requireAuth = (req: any, _res: any, next: any) => {
  // Simula usuário autenticado
  req.authUserId = 'user_test_123';
  next();
};

export const requireApiAuth = (req: any, _res: any, next: any) => {
  // Simula usuário autenticado
  req.authUserId = 'user_test_123';
  next();
};

export const getAuth = jest.fn(() => ({
  userId: 'user_test_123',
}));

export default { requireAuth, requireApiAuth, getAuth };
