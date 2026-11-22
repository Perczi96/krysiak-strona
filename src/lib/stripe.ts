// ============================================
// Stripe Helpers (Frontend)
// ============================================

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Klucz publikowalny z env (test mode: pk_test_...)
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) {
    console.warn('Stripe publishable key not configured');
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// ============================================
// Price IDs mapping (z bazy tiers)
// ============================================

export interface TierPriceIds {
  monthly?: string;
  yearly?: string;
}

export function getTierPriceIds(tier: { stripe_price_id_monthly: string | null; stripe_price_id_yearly: string | null }): TierPriceIds {
  return {
    monthly: tier.stripe_price_id_monthly || undefined,
    yearly: tier.stripe_price_id_yearly || undefined
  };
}

// ============================================
// Checkout helpers
// ============================================

export interface CheckoutParams {
  tierId: string;
  mode: 'subscription' | 'payment';
  billingCycle?: 'monthly' | 'yearly';
  successUrl?: string;
  cancelUrl?: string;
}

export async function redirectToCheckout(params: CheckoutParams): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    console.error('Stripe not loaded');
    return;
  }

  // W trybie testowym bez Stripe - symulacja
  if (import.meta.env.VITE_TEST_MODE === 'true') {
    const testUrl = new URL(params.successUrl || window.location.origin + '/konto?supporter=success');
    testUrl.searchParams.set('test_mode', 'true');
    testUrl.searchParams.set('tier_id', params.tierId);
    window.location.href = testUrl.toString();
    return;
  }

  // Normalny flow przez Edge Function
  const { supabase } = await import('./supabase');
  const result = await supabase.functions.invoke('stripe-create-checkout', {
    body: params
  });

  if (result.error) {
    console.error('Checkout creation failed:', result.error);
    return;
  }

  if (result.data?.url) {
    window.location.href = result.data.url;
  }
}

// ============================================
// Customer Portal
// ============================================

export async function redirectToCustomerPortal(returnUrl?: string): Promise<void> {
  const { supabase } = await import('./supabase');

  if (import.meta.env.VITE_TEST_MODE === 'true') {
    window.location.href = returnUrl || '/konto';
    return;
  }

  const result = await supabase.functions.invoke('stripe-create-portal', {
    body: { return_url: returnUrl || window.location.origin + '/konto' }
  });

  if (result.error) {
    console.error('Portal creation failed:', result.error);
    return;
  }

  if (result.data?.url) {
    window.location.href = result.data.url;
  }
}

// ============================================
// Format price for display
// ============================================

export function formatPricePLN(priceInGroszy: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2
  }).format(priceInGroszy / 100);
}

export function formatPricePLNCompact(priceInGroszy: number): string {
  const zl = priceInGroszy / 100;
  if (zl >= 1000) {
    return `${(zl / 1000).toFixed(zl % 1000 === 0 ? 0 : 1)}k PLN`;
  }
  return `${zl.toFixed(zl % 1 === 0 ? 0 : 2)} PLN`;
}