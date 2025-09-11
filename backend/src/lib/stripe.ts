import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion opcional; se definir, use uma válida da sua conta
});


