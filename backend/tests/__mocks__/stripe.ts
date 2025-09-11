class StripeMock {
  checkout = {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://stripe.test/session/cs_test_123',
        payment_intent: 'pi_test_123',
        status: 'open',
        metadata: {}
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        status: 'complete',
        payment_intent: 'pi_test_123',
        metadata: {}
      }),
    },
  };

  paymentIntents = {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 5000,
      currency: 'brl',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 5000,
      currency: 'brl',
    }),
  };

  webhooks = {
    constructEvent: jest.fn().mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            contributionId: 'contrib_123'
          },
          payment_intent: 'pi_test_123'
        }
      }
    })
  };

  // Método para simular erros do Stripe
  simulateError(errorType: 'network' | 'card_declined' | 'insufficient_funds' = 'network') {
    const error = new Error(`Stripe ${errorType} error`);
    (error as any).type = errorType;
    (error as any).code = errorType === 'card_declined' ? 'card_declined' : 'api_error';
    
    this.checkout.sessions.create.mockRejectedValueOnce(error);
    this.paymentIntents.create.mockRejectedValueOnce(error);
  }

  // Método para resetar mocks
  reset() {
    this.checkout.sessions.create.mockReset();
    this.checkout.sessions.retrieve.mockReset();
    this.paymentIntents.create.mockReset();
    this.paymentIntents.retrieve.mockReset();
    this.webhooks.constructEvent.mockReset();
  }
}

export default StripeMock as any;
