import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/auth';
import QRCode from 'qrcode';
import { 
  createPaymentPreference, 
  getPaymentById, 
  processWebhook,
  PaymentData,
  PaymentMethod,
  PaymentStatus
} from '../config/mercadoPago';

const prisma = new PrismaClient();

export interface GenerateQRCodeRequest {
  campaignId: string;
  amount: number;
  description?: string;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
}

export interface CreatePaymentRequest {
  campaignId: string;
  amount: number;
  description?: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  payerEmail: string;
  payerName: string;
  payerDocument: string;
}

// In-memory storage for payments (in production, use Redis or database)
const paymentStore = new Map<string, {
  id: string;
  campaignId: string;
  userId: string;
  amount: number;
  description: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}>();

export const generateQRCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId, amount, description }: GenerateQRCodeRequest = req.body;

    // Validate required fields
    if (!campaignId || !amount) {
      throw createError('Campaign ID and amount are required', 400);
    }

    // Validate amount is positive
    if (amount <= 0) {
      throw createError('Amount must be a positive number', 400);
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    if (!campaign.isActive) {
      throw createError('Campaign is not active', 400);
    }

    // Check if campaign deadline has passed
    if (new Date() > campaign.deadline) {
      throw createError('Campaign deadline has passed', 400);
    }

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Generate payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment data for QR code
    const paymentData = {
      paymentId,
      campaignId,
      userId: user.id,
      amount,
      description: description || `Support for ${campaign.title}`,
      timestamp: new Date().toISOString()
    };

    // Generate QR code
    const qrCodeData = JSON.stringify(paymentData);
    const qrCode = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Store payment in memory
    paymentStore.set(paymentId, {
      id: paymentId,
      campaignId,
      userId: user.id,
      amount,
      description: description || `Support for ${campaign.title}`,
      status: 'pending',
      createdAt: new Date()
    });

    res.success({
      qrCode,
      paymentId,
      amount: amount.toString(),
      campaignId,
      description: description || `Support for ${campaign.title}`
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId }: ConfirmPaymentRequest = req.body;

    // Validate required fields
    if (!paymentId) {
      throw createError('Payment ID is required', 400);
    }

    // Get payment from store
    const payment = paymentStore.get(paymentId);

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    // Check if payment is already confirmed
    if (payment.status === 'confirmed') {
      throw createError('Payment already confirmed', 400);
    }

    // Check if payment is failed
    if (payment.status === 'failed') {
      throw createError('Payment failed', 400);
    }

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Check if user owns this payment
    if (payment.userId !== user.id) {
      throw createError('You can only confirm your own payments', 403);
    }

    // Update payment status
    payment.status = 'confirmed';
    paymentStore.set(paymentId, payment);

    // Create support record
    const support = await prisma.support.create({
      data: {
        campaignId: payment.campaignId,
        userId: payment.userId,
        amount: payment.amount,
        message: `Payment confirmed via QR Code - ${payment.description}`,
        isAnonymous: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true,
            goal: true,
            current: true
          }
        }
      }
    });

    // Update campaign current amount
    await prisma.campaign.update({
      where: { id: payment.campaignId },
      data: {
        current: {
          increment: payment.amount
        }
      }
    });

    res.success({
      status: 'confirmed',
      amount: payment.amount.toString(),
      campaignId: payment.campaignId,
      support
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId } = req.params;

    // Get payment from store
    const payment = paymentStore.get(paymentId);

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Check if user owns this payment
    if (payment.userId !== user.id) {
      throw createError('You can only view your own payments', 403);
    }

    res.success({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount.toString(),
      campaignId: payment.campaignId,
      description: payment.description,
      createdAt: payment.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// Create payment preference with Mercado Pago
export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      campaignId, 
      amount, 
      description, 
      paymentMethod, 
      installments,
      payerEmail,
      payerName,
      payerDocument
    }: CreatePaymentRequest = req.body;

    // Validate required fields
    if (!campaignId || !amount || !payerEmail || !payerName || !payerDocument) {
      throw createError('Campaign ID, amount, payer email, name and document are required', 400);
    }

    // Validate amount is positive
    if (amount <= 0) {
      throw createError('Amount must be a positive number', 400);
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    if (!campaign.isActive) {
      throw createError('Campaign is not active', 400);
    }

    // Check if campaign deadline has passed
    if (new Date() > campaign.deadline) {
      throw createError('Campaign deadline has passed', 400);
    }

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Create payment data
    const paymentData: PaymentData = {
      campaignId,
      userId: user.id,
      amount,
      description: description || `Support for ${campaign.title}`,
      paymentMethod,
      installments: installments || 1,
      payerEmail,
      payerName,
      payerDocument,
    };

    // Create payment preference
    const preference = await createPaymentPreference(paymentData);

    res.success({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      amount: amount.toString(),
      campaignId,
      description: description || `Support for ${campaign.title}`,
      paymentMethod,
      installments: installments || 1,
    });
  } catch (error) {
    next(error);
  }
};

// Handle Mercado Pago webhook
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhookData = req.body;

    // Process webhook
    const paymentInfo = await processWebhook(webhookData);

    if (!paymentInfo) {
      res.status(200).json({ message: 'Webhook processed successfully' });
      return;
    }

    const { paymentId, campaignId, userId, status, amount, paymentMethod, installments, dateApproved } = paymentInfo;

    // Check if support already exists
    const existingSupport = await prisma.support.findUnique({
      where: { paymentId }
    });

    if (existingSupport) {
      res.status(200).json({ message: 'Payment already processed' });
      return;
    }

    // Create support record
    const support = await prisma.support.create({
      data: {
        campaignId,
        userId,
        amount,
        message: `Payment via ${paymentMethod}`,
        isAnonymous: false,
        paymentId,
        paymentStatus: status,
        paymentMethod,
        installments,
        dateApproved: dateApproved ? new Date(dateApproved) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true,
            goal: true,
            current: true
          }
        }
      }
    });

    // Update campaign current amount if payment is approved
    if (status === PaymentStatus.APPROVED) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          current: {
            increment: amount
          }
        }
      });
    }

    res.status(200).json({ 
      message: 'Webhook processed successfully',
      supportId: support.id,
      status
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get payment status from Mercado Pago
export const getPaymentStatusFromMP = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId } = req.params;

    // Get payment from Mercado Pago
    const payment = await getPaymentById(paymentId);

    // Extract campaign and user IDs from external reference
    const [campaignId, userId] = payment.externalReference.split('_');

    // Get user from Clerk
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth!.userId }
    });

    if (!user) {
      throw createError('User not found. Please complete your profile first.', 404);
    }

    // Check if user owns this payment
    if (userId !== user.id) {
      throw createError('You can only view your own payments', 403);
    }

    res.success({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.statusDetail,
      amount: payment.transactionAmount.toString(),
      campaignId,
      paymentMethod: payment.paymentMethodId,
      installments: payment.installments,
      description: payment.description,
      dateCreated: payment.dateCreated,
      dateApproved: payment.dateApproved,
      dateLastUpdated: payment.dateLastUpdated,
      payer: payment.payer,
    });
  } catch (error) {
    next(error);
  }
};
