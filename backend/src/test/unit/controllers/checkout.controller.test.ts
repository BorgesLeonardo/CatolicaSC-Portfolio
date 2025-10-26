import { Request, Response } from 'express';
import { createCheckoutSession } from '../../../controllers/checkout.controller';
import { stripe } from '../../../utils/stripeClient';
import { prisma } from '../../../infrastructure/prisma';
import { AppError } from '../../../utils/AppError';

describe('CheckoutController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    const validCheckoutData = {
      projectId: 'cm12345678901234567890',
      amount: 1000,
      currency: 'BRL',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    it('should create checkout session successfully', async () => {
      const mockProject = {
        id: 'cm12345678901234567890',
        title: 'Test Project',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg',
      };
      const mockSession = { id: 'cs_test_123' };

      // Configure mocks before calling the function
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);
      (mockRequest as any).authUserId = 'user123';

      // Provide valid body
      mockRequest.body = validCheckoutData as any;
      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: validCheckoutData.projectId },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
        }
      });
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: validCheckoutData.amount,
              product_data: {
                name: mockProject.title,
                description: mockProject.description,
                images: [mockProject.imageUrl],
              },
            },
            quantity: 1,
          },
        ],
        success_url: validCheckoutData.successUrl,
        cancel_url: validCheckoutData.cancelUrl,
        metadata: {
          projectId: validCheckoutData.projectId,
          userId: 'user123',
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ id: mockSession.id });
    });

    it('should create checkout session without user ID', async () => {
      const mockProject = {
        id: 'cm12345678901234567890',
        title: 'Test Project',
        description: 'Test description',
        imageUrl: null,
      };
      const mockSession = { id: 'cs_test_123' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);

      mockRequest.body = validCheckoutData as any;
      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: validCheckoutData.amount,
              product_data: {
                name: mockProject.title,
                description: mockProject.description,
              },
            },
            quantity: 1,
          },
        ],
        success_url: validCheckoutData.successUrl,
        cancel_url: validCheckoutData.cancelUrl,
        metadata: {
          projectId: validCheckoutData.projectId,
        },
      });
    });

    it('should throw AppError for missing required fields', async () => {
      mockRequest.body = { projectId: 'cm12345678901234567890' }; // Missing other fields

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should throw AppError for amount too low', async () => {
      mockRequest.body = { ...validCheckoutData, amount: 400 }; // Below minimum

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Amount must be at least R$ 5.00' });
    });

    it('should throw AppError when project not found', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
      mockRequest.body = validCheckoutData;

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should handle project without image', async () => {
      const mockProject = {
        id: 'cm12345678901234567890',
        title: 'Test Project',
        description: 'Test description',
        imageUrl: null,
      };
      const mockSession = { id: 'cs_test_123' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);
      mockRequest.body = validCheckoutData;

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: validCheckoutData.amount,
              product_data: {
                name: mockProject.title,
                description: mockProject.description,
              },
            },
            quantity: 1,
          },
        ],
        success_url: validCheckoutData.successUrl,
        cancel_url: validCheckoutData.cancelUrl,
        metadata: {
          projectId: validCheckoutData.projectId,
        },
      });
    });

    it('should handle project without description', async () => {
      const mockProject = {
        id: 'cm12345678901234567890',
        title: 'Test Project',
        description: null,
        imageUrl: 'https://example.com/image.jpg',
      };
      const mockSession = { id: 'cs_test_123' };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);
      mockRequest.body = validCheckoutData;

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: validCheckoutData.amount,
              product_data: {
                name: mockProject.title,
                description: 'Contribuição para campanha',
                images: [mockProject.imageUrl],
              },
            },
            quantity: 1,
          },
        ],
        success_url: validCheckoutData.successUrl,
        cancel_url: validCheckoutData.cancelUrl,
        metadata: {
          projectId: validCheckoutData.projectId,
        },
      });
    });

    it('should handle Stripe errors', async () => {
      const mockProject = {
        id: 'cm12345678901234567890',
        title: 'Test Project',
        description: 'Test description',
        imageUrl: null,
      };
      const stripeError = new Error('Stripe error');

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(stripeError);
      mockRequest.body = validCheckoutData;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith('Error creating checkout session:', stripeError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });

      consoleSpy.mockRestore();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      (prisma.project.findUnique as jest.Mock).mockRejectedValue(dbError);
      mockRequest.body = validCheckoutData;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await createCheckoutSession(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith('Error creating checkout session:', dbError);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });

      consoleSpy.mockRestore();
    });
  });
});
