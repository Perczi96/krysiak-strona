import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================
// Supabase Client (singleton)
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// ============================================
// Types
// ============================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Tier = Database['public']['Tables']['tiers']['Row'];
export type Content = Database['public']['Tables']['content']['Row'];
export type ContentInsert = Database['public']['Tables']['content']['Insert'];
export type ContentUpdate = Database['public']['Tables']['content']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

export type PaymentEvent = Database['public']['Tables']['payment_events']['Row'];

// Extended types with relations
export type ContentWithAuthor = Content & {
  author?: Profile;
  comment_count?: number;
};

export type ProfileWithTier = Profile & {
  tier?: Tier;
};

// ============================================
// Auth Helpers
// ============================================

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(userId: string): Promise<ProfileWithTier | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      tier:tiers(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getProfile error:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('updateProfile error:', error);
    return null;
  }
  return data;
}

// ============================================
// Content Helpers
// ============================================

export async function getContentList(params: {
  visibility?: 'public' | 'subscriber' | 'supporter';
  type?: Content['type'];
  tier_id?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'published_at' | 'created_at';
  ascending?: boolean;
} = {}): Promise<Content[]> {
  let query = supabase
    .from('content')
    .select('*')
    .order(params.orderBy || 'published_at', { ascending: params.ascending ?? false });

  if (params.visibility) query = query.eq('visibility', params.visibility);
  if (params.type) query = query.eq('type', params.type);
  if (params.tier_id) query = query.eq('tier_id', params.tier_id);
  if (params.featured !== undefined) query = query.eq('is_featured', params.featured);

  // Only published content
  query = query.lte('published_at', new Date().toISOString());

  if (params.limit) query = query.limit(params.limit);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1);

  const { data, error } = await query;

  if (error) {
    console.error('getContentList error:', error);
    return [];
  }
  return data || [];
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getContentBySlug error:', error);
    return null;
  }
  return data;
}

export async function incrementViewCount(contentId: string): Promise<void> {
  await (supabase as any).rpc('increment_view_count', { content_id: contentId });
}

// ============================================
// Comments Helpers
// ============================================

export async function getComments(contentId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url, role)
    `)
    .eq('content_id', contentId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getComments error:', error);
    return [];
  }
  return data || [];
}

export async function getCommentReplies(parentId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url, role)
    `)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getCommentReplies error:', error);
    return [];
  }
  return data || [];
}

export async function addComment(contentId: string, body: string): Promise<Comment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await (supabase as any)
    .from('comments')
    .insert({ content_id: contentId, user_id: user.id, body })
    .select(`
      *,
      user:profiles!user_id(display_name, avatar_url, role)
    `)
    .single();

  if (error) {
    console.error('addComment error:', error);
    return null;
  }
  return data;
}

// ============================================
// Tiers Helpers
// ============================================

export async function getActiveTiers(): Promise<Tier[]> {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getActiveTiers error:', error);
    return [];
  }
  return data || [];
}

export async function getTierBySlug(slug: string): Promise<Tier | null> {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error) {
    console.error('getTierBySlug error:', error);
    return null;
  }
  return data;
}

// ============================================
// Real-time Subscriptions
// ============================================

export function subscribeToComments(contentId: string, callback: (comment: Comment) => void) {
  return supabase
    .channel(`comments:${contentId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `content_id=eq.${contentId}`
      },
      (payload) => callback(payload.new as Comment)
    )
    .subscribe();
}

export function subscribeToContentChanges(callback: (content: Content) => void) {
  return supabase
    .channel('content_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'content'
      },
      (payload) => callback(payload.new as Content)
    )
    .subscribe();
}

// ============================================
// Edge Function Invocations
// ============================================

export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body: Record<string, any>,
  options?: { method?: 'POST' | 'GET' }
): Promise<T | null> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
    method: options?.method || 'POST'
  });

  if (error) {
    console.error(`Edge Function ${functionName} error:`, error);
    return null;
  }
  return data;
}

// Stripe Checkout
export async function createStripeCheckout(params: {
  tierId: string;
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string } | null> {
  return invokeEdgeFunction('stripe-create-checkout', params);
}

// Stripe Customer Portal
export async function createStripePortalSession(params: {
  returnUrl?: string;
}): Promise<{ url: string } | null> {
  return invokeEdgeFunction('stripe-create-portal', params);
}

// Web Push subscription
export async function savePushSubscription(subscription: PushSubscription): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ push_subscription: subscription.toJSON() })
    .eq('id', user.id);

  return !error;
}

export async function removePushSubscription(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ push_subscription: null })
    .eq('id', user.id);

  return !error;
}

// ============================================
// Test Mode Helper (symulacja supportera bez Stripe)
// ============================================

export function isTestMode(): boolean {
  return import.meta.env.VITE_TEST_MODE === 'true';
}

export async function enableTestSupporterMode(): Promise<boolean> {
  if (!isTestMode()) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Znajdź testowy tier
  const { data: tier } = await (supabase as any)
    .from('tiers')
    .select('id')
    .eq('slug', 'test')
    .single();

  if (!tier) return false;

  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      role: 'supporter',
      tier_id: tier.id,
      subscription_status: 'active',
      subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', user.id);

  return !error;
}

export async function disableTestSupporterMode(): Promise<boolean> {
  if (!isTestMode()) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      role: 'subscriber',
      tier_id: null,
      subscription_status: null,
      subscription_period_end: null
    })
    .eq('id', user.id);

  return !error;
}