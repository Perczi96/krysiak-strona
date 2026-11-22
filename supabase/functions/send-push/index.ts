// ============================================
// Send Web Push Notification (Edge Function)
// Uses npm:web-push which works in Deno
// ============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webPush from 'npm:web-push@3.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize web-push with VAPID keys
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@bezmaski.pl';

webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: {
    url?: string;
    contentId?: string;
    type?: 'new_content' | 'live_start' | 'announcement' | 'comment' | 'reply';
  };
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

interface StoredPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    // Allow service role to send to any user (for automated notifications)
    const isServiceRole = authHeader.includes('service_role');
    let targetUserId = user?.id;

    if (isServiceRole) {
      const body = await req.json();
      targetUserId = body.user_id;
      if (!targetUserId) {
        throw new Error('Service role must provide user_id');
      }
    } else if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's push subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_subscription, push_notifications')
      .eq('id', targetUserId)
      .single();

    if (!profile?.push_subscription) {
      return new Response(
        JSON.stringify({ error: 'No push subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.push_notifications) {
      return new Response(
        JSON.stringify({ error: 'Push notifications disabled for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = profile.push_subscription;
    const payload = await req.json();

    // Prepare push payload
    const pushPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/badge-72.png',
      image: payload.image,
      data: payload.data || {},
      actions: payload.actions || [
        { action: 'open', title: 'Otwórz' },
        { action: 'dismiss', title: 'Zamknij' }
      ],
      requireInteraction: payload.requireInteraction ?? false,
      silent: payload.silent ?? false,
      vibrate: payload.vibrate || [100, 50, 100],
      timestamp: payload.timestamp || Date.now(),
    };

    // Send push notification
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          keys: subscription.keys,
        },
        JSON.stringify(pushPayload)
      );

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pushError: any) {
      // Handle expired/invalid subscriptions
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        // Remove invalid subscription
        await supabase
          .from('profiles')
          .update({ push_subscription: null })
          .eq('id', targetUserId);

        return new Response(
          JSON.stringify({ error: 'Subscription expired, removed' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw pushError;
    }
  } catch (error) {
    console.error('send-push error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================
// Helper function to send push to multiple users
// Can be called from other Edge Functions
// ============================================

/*
async function sendPushToUsers(
  supabase: any,
  userIds: string[],
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, push_subscription, push_notifications')
    .in('id', userIds)
    .eq('push_notifications', true)
    .not('push_subscription', 'is', null);

  if (!profiles || profiles.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const profile of profiles) {
    try {
      await webPush.sendNotification(
        {
          endpoint: profile.push_subscription.endpoint,
          expirationTime: profile.push_subscription.expirationTime,
          keys: profile.push_subscription.keys,
        },
        JSON.stringify(payload)
      );
      success++;
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        await supabase
          .from('profiles')
          .update({ push_subscription: null })
          .eq('id', profile.id);
      }
      failed++;
    }
  }

  return { success, failed };
}
*/