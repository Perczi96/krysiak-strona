// ============================================
// Web Push (VAPID) - Frontend & Deno-compatible helpers
// ============================================

// VAPID public key z env
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// ============================================
// Convert base64 URL-safe to Uint8Array (dla pushManager.subscribe)
// ============================================

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// Subscribe user to push notifications
// ============================================

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!vapidPublicKey) {
    console.warn('VAPID public key not configured');
    return null;
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      // Zapisz istniejącą subskrypcję
      await saveSubscriptionToServer(existingSubscription);
      return existingSubscription;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
    });

    await saveSubscriptionToServer(subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// ============================================
// Unsubscribe from push notifications
// ============================================

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

// ============================================
// Save/remove subscription to Supabase
// ============================================

async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ push_subscription: subscription.toJSON() })
      .eq('id', user.id);

    if (error) console.error('Failed to save push subscription:', error);
  } catch (error) {
    console.error('saveSubscriptionToServer error:', error);
  }
}

async function removeSubscriptionFromServer(): Promise<void> {
  try {
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ push_subscription: null })
      .eq('id', user.id);

    if (error) console.error('Failed to remove push subscription:', error);
  } catch (error) {
    console.error('removeSubscriptionFromServer error:', error);
  }
}

// ============================================
// Check if user has push subscription
// ============================================

export async function hasPushSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

// ============================================
// Request notification permission
// ============================================

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

// ============================================
// Check if push is supported and available
// ============================================

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;
}

export function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// ============================================
// Deno-compatible Web Push types (for Edge Functions)
// ============================================

/**
 * Web Push payload structure for Edge Functions (Deno)
 * Używane w supabase/functions/send-push/index.ts
 */
export interface PushPayload {
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
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

/**
 * Push subscription from database (JSONB)
 */
export interface StoredPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ============================================
// VAPID Key generation helper (run once)
// ============================================

/**
 * Generuj klucze VAPID:
 * npx web-push generate-vapid-keys
 *
 * Zwróci:
 * Public Key:  Bxxxx...
 * Private Key: xxxx...
 *
 * Wstaw do:
 * - VITE_VAPID_PUBLIC_KEY (frontend .env)
 * - VAPID_PRIVATE_KEY (Supabase Vault / Edge Function secrets)
 * - VAPID_SUBJECT=mailto:your-email@example.com (Supabase Vault)
 */