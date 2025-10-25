import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Use default API version from account; override via env if needed
  // apiVersion: process.env.STRIPE_API_VERSION as any,
})
