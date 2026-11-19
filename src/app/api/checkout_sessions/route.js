import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../../lib/stripe';

const PLAN_DETAILS = {
  premium_monthly: {
    name: 'WedPlan Vendor Premium (Monthly)',
    description: 'Unlimited service listings, featured placement, and full booking management.',
    priceInCents: 2900, // $29.00
  },
  premium_yearly: {
    name: 'WedPlan Vendor Premium (Yearly)',
    description: 'Full year access to unlimited service listings, featured placement, and priority support.',
    priceInCents: 29000, // $290.00
  },
};

export async function POST(req) {
  try {
    const headersList = await headers();
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const origin =
      body.origin ||
      headersList.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const planId =
      body.planId === 'premium_yearly' ? 'premium_yearly' : 'premium_monthly';
    const planConfig = PLAN_DETAILS[planId];

    // Create Checkout Session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: planConfig.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: body.email || undefined,
      metadata: {
        vendorId: String(body.vendorId || ''),
        planId: planId,
      },
      success_url: `${origin}/vendor/subscription?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${origin}/vendor/subscription?canceled=true`,
    });

    const acceptHeader = headersList.get('accept') || '';
    const contentType = headersList.get('content-type') || '';

    if (contentType.includes('application/json') || acceptHeader.includes('application/json')) {
      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create checkout session.' },
      { status: err.statusCode || 500 }
    );
  }
}
