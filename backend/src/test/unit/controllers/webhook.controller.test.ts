import { Request, Response } from 'express';
import { handleStripeWebhook } from '../../../controllers/webhook.controller';
import { stripe } from '../../../utils/stripeClient';
import { createContributionFromCheckoutSession } from '../../../services/contribution.service';
import { AppError } from '../../../utils/AppError';

// Mock do Stripe e ContributionService
jest.mock('../../../utils/stripeClient');
jest.mock('../../../services/contribution.service');

describe('WebhookController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: Buffer.from('test-body'),
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('handleStripeWebhook', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, STRIPE_WEBHOOK_SECRET: 'whsec_test_secret' };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should handle checkout.session.completed event successfully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              projectId: 'cm12345678901234567890',
              userId: 'user123',
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (createContributionFromCheckoutSession as jest.Mock).mockResolvedValue(undefined);
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRequest.body,
        'test-signature',
        'whsec_test_secret'
      );
      expect(createContributionFromCheckoutSession).toHaveBeenCalledWith(mockEvent.data.object);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test_123' } },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRequest.body,
        'test-signature',
        'whsec_test_secret'
      );
      expect(createContributionFromCheckoutSession).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_test_123' } },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRequest.body,
        'test-signature',
        'whsec_test_secret'
      );
      expect(createContributionFromCheckoutSession).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle unhandled event types', async () => {
      const mockEvent = {
        type: 'customer.created',
        data: { object: { id: 'cus_test_123' } },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRequest.body,
        'test-signature',
        'whsec_test_secret'
      );
      expect(createContributionFromCheckoutSession).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should throw AppError when webhook secret is not configured', async () => {
      process.env.STRIPE_WEBHOOK_SECRET = undefined;

      await expect(handleStripeWebhook(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow(new AppError('Stripe webhook secret not configured', 500));
    });

    it('should return 400 when webhook signature verification fails', async () => {
      const signatureError = new Error('Invalid signature');
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw signatureError;
      });
      mockRequest.headers = { 'stripe-signature': 'invalid-signature' };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith('Webhook signature verification failed:', signatureError.message);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(`Webhook Error: ${signatureError.message}`);

      consoleSpy.mockRestore();
    });

    it('should handle errors during contribution creation', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              projectId: 'cm12345678901234567890',
              userId: 'user123',
            },
          },
        },
      };

      const contributionError = new Error('Contribution creation failed');
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (createContributionFromCheckoutSession as jest.Mock).mockRejectedValue(contributionError);
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith('Error processing webhook:', contributionError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Webhook processing failed' });

      consoleSpy.mockRestore();
    });

    it('should handle general errors during webhook processing', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              projectId: 'cm12345678901234567890',
              userId: 'user123',
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (createContributionFromCheckoutSession as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      mockRequest.headers = { 'stripe-signature': 'test-signature' };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleStripeWebhook(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith('Error processing webhook:', expect.any(Error));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Webhook processing failed' });

      consoleSpy.mockRestore();
    });
  });
});
