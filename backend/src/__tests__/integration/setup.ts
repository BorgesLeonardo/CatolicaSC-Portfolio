import { testPrisma, cleanupTestDatabase } from '../../config/testDatabase';

// Global setup for integration tests
beforeAll(async () => {
  // Clean up any existing test data
  await cleanupTestDatabase();
});

afterAll(async () => {
  // Clean up after all tests
  await cleanupTestDatabase();
  await testPrisma.$disconnect();
});

// Clean up before each test
beforeEach(async () => {
  await cleanupTestDatabase();
});

// Mock Clerk authentication for integration tests
jest.mock('../../middlewares/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    // Mock authenticated user
    req.auth = {
      userId: 'test_user_1',
      sessionId: 'test_session_1',
    };
    next();
  },
}));

// Mock Mercado Pago for integration tests
jest.mock('../../config/mercadoPago', () => ({
  createPaymentPreference: jest.fn().mockResolvedValue({
    id: 'test-preference-id',
    init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id',
    sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id',
  }),
  getPaymentById: jest.fn().mockResolvedValue({
    id: 'test-payment-id',
    status: 'approved',
    statusDetail: 'accredited',
    transactionAmount: 100.00,
    paymentMethodId: 'credit_card',
    installments: 1,
    description: 'Test payment',
    externalReference: 'test-campaign_test-user',
    dateCreated: new Date().toISOString(),
    dateApproved: new Date().toISOString(),
    dateLastUpdated: new Date().toISOString(),
    payer: {
      email: 'test@example.com',
      identification: {
        type: 'CPF',
        number: '12345678901',
      },
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  processWebhook: jest.fn().mockResolvedValue({
    paymentId: 'test-payment-id',
    campaignId: 'test-campaign',
    userId: 'test-user',
    status: 'approved',
    amount: 100.00,
    paymentMethod: 'credit_card',
    installments: 1,
    dateApproved: new Date().toISOString(),
  }),
  PaymentStatus: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    IN_PROCESS: 'in_process',
    IN_MEDIATION: 'in_mediation',
  },
  PaymentMethod: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PIX: 'pix',
    BOLETO: 'boleto',
    BANK_TRANSFER: 'bank_transfer',
  },
}));
