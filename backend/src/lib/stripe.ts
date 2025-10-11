import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || process.env.STRIPE_API_KEY;
if (!secret) {
  throw new Error('STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(secret, {
  // apiVersion opcional; se definir, use uma válida da sua conta
});


