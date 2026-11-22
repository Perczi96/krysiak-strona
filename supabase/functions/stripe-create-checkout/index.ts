// ============================================
// Stripe Create Checkout Session (Edge Function)
// Deno-compatible, uses npm:stripe
// ============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { tierId, mode, billingCycle, successUrl, cancelUrl } = await req.json();

    if (!tierId || !mode) {
      throw new Error('Missing required parameters: tierId, mode');
    }

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('tiers')
      .select('*')
      .eq('id', tierId)
      .eq('active', true)
      .single();

    if (tierError || !tier) {
      throw new Error('Tier not found');
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Determine price ID
    const priceId = billingCycle === 'yearly' && tier.stripe_price_id_yearly
      ? tier.stripe_price_id_yearly
      : tier.stripe_price_id_monthly;

    if (!priceId) {
      throw new Error('Price ID not configured for this tier');
    }

    // Create checkout session
    const sessionParams = {
      customer: customerId,
      payment_method_types: ['card', 'blik', 'p24'], // BLIK and Przelewy24 for PL
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl || `${Deno.env.get('SITE_URL')}/konto?checkout=success`,
      cancel_url: cancelUrl || `${Deno.env.get('SITE_URL')}/konto?checkout=canceled`,
      metadata: {
        user_id: user.id,
        tier_id: tierId,
        billing_cycle: billingCycle || 'monthly',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pl',
    };

    // For one-time payments (BLIK/P24), add specific config
    if (mode === 'payment') {
      sessionParams.payment_method_types = ['card', 'blik', 'p24'];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('stripe-create-checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});