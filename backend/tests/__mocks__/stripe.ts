class StripeMock {
  checkout = {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://stripe.test/session/cs_test_123'
      }),
    },
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
}

export default StripeMock as any;
