import 'server-only';
import Stripe from 'stripe';

const apiKey =
  process.env.STRIPE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ||
  '';

export const stripe = new Stripe(apiKey);
