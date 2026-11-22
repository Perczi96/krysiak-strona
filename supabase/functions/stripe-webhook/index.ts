// ============================================
// Stripe Webhook Handler (Edge Function)
// Handles all Stripe events and updates Supabase
// ============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Store event for debugging
    await supabase.from('payment_events').insert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event.data.object,
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionChange(supabase, event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
      }
      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(supabase, event.data.object);
        break;
      }
      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(supabase, event.data.object);
        break;
      }
      case 'customer.subscription.trial_will_end': {
        // Could send notification email
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckoutCompleted(supabase: any, session: any) {
  const userId = session.metadata?.user_id;
  const tierId = session.metadata?.tier_id;
  const billingCycle = session.metadata?.billing_cycle || 'monthly';

  if (!userId || !tierId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription if it's a subscription checkout
  let subscriptionId = session.subscription;
  if (typeof subscriptionId === 'object') {
    subscriptionId = subscriptionId.id;
  }

  // Update profile
  const updates: any = {
    role: 'supporter',
    tier_id: tierId,
    stripe_subscription_id: subscriptionId,
    subscription_status: 'active',
    subscription_cancel_at_period_end: false,
  };

  if (billingCycle === 'yearly') {
    // Calculate period end for yearly
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    updates.subscription_period_end = periodEnd.toISOString();
  }

  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  console.log(`User ${userId} upgraded to supporter tier ${tierId}`);
}

async function handleSubscriptionChange(supabase: any, subscription: any) {
  // Find user by subscription ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tier_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!profile) {
    // Try to find by customer ID
    const { data: profileByCustomer } = await supabase
      .from('profiles')
      .select('id, tier_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (profileByCustomer) {
      await supabase
        .from('profiles')
        .update({ stripe_subscription_id: subscription.id })
        .eq('id', profileByCustomer.id);
    }
    return;
  }

  // Determine tier from subscription price
  const priceId = subscription.items.data[0]?.price.id;
  let tierId = profile.tier_id;

  if (priceId) {
    const { data: tier } = await supabase
      .from('tiers')
      .select('id')
      .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
      .single();

    if (tier) tierId = tier.id;
  }

  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    trialing: 'trialing',
  };

  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  await supabase
    .from('profiles')
    .update({
      role: subscription.status === 'active' || subscription.status === 'trialing' ? 'supporter' : 'subscriber',
      tier_id: tierId,
      subscription_status: statusMap[subscription.status] || 'incomplete',
      subscription_period_end: periodEnd,
      subscription_cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('id', profile.id);
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        role: 'subscriber',
        tier_id: null,
        stripe_subscription_id: null,
        subscription_status: 'canceled',
        subscription_period_end: null,
        subscription_cancel_at_period_end: false,
      })
      .eq('id', profile.id);
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, invoice: any) {
  // Update subscription status to active if it was past_due
  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', profile.id);
    }
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: any) {
  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('id', profile.id);
    }
  }
}