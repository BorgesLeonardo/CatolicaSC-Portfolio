import { MercadoPagoConfig, Preference } from 'mercadopago';

// Mercado Pago configuration
const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc',
  },
});

// Create preference instance
export const preference = new Preference(mercadoPagoConfig);

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
}

// Payment method enum
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BOLETO = 'boleto',
  BANK_TRANSFER = 'bank_transfer',
}

// Interface for payment data
export interface PaymentData {
  campaignId: string;
  userId: string;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  payerEmail: string;
  payerName: string;
  payerDocument: string;
}

// Interface for payment response
export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  statusDetail: string;
  transactionAmount: number;
  paymentMethodId: string;
  installments: number;
  description: string;
  externalReference: string;
  dateCreated: string;
  dateApproved?: string;
  dateLastUpdated: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
    firstName: string;
    lastName: string;
  };
}

// Helper function to create payment preference
export const createPaymentPreference = async (paymentData: PaymentData) => {
  try {
    const preferenceData = {
      items: [
        {
          title: paymentData.description,
          quantity: 1,
          unit_price: paymentData.amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: paymentData.payerName,
        email: paymentData.payerEmail,
        identification: {
          type: 'CPF',
          number: paymentData.payerDocument,
        },
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: paymentData.installments || 1,
      },
      external_reference: `${paymentData.campaignId}_${paymentData.userId}`,
      notification_url: `${process.env.API_BASE_URL}/api/payments/webhook`,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/campaigns/${paymentData.campaignId}?payment=success`,
        failure: `${process.env.FRONTEND_URL}/campaigns/${paymentData.campaignId}?payment=failure`,
        pending: `${process.env.FRONTEND_URL}/campaigns/${paymentData.campaignId}?payment=pending`,
      },
      auto_return: 'approved',
    };

    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw new Error('Failed to create payment preference');
  }
};

// Helper function to get payment by ID
export const getPaymentById = async (paymentId: string): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error('Failed to fetch payment');
  }
};

// Helper function to process webhook
export const processWebhook = async (webhookData: any) => {
  try {
    const { data, type } = webhookData;
    
    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await getPaymentById(paymentId);
      
      // Extract campaign and user IDs from external reference
      const [campaignId, userId] = payment.externalReference.split('_');
      
      return {
        paymentId,
        campaignId,
        userId,
        status: payment.status,
        amount: payment.transactionAmount,
        paymentMethod: payment.paymentMethodId,
        installments: payment.installments,
        dateApproved: payment.dateApproved,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw new Error('Failed to process webhook');
  }
};
