// ============================================
// Database Types - Generated from Supabase
// Uruchom: npm run generate:types (wymaga skonfigurowanego projektu)
// Na razie placeholder types - zastąpią się po podłączeniu Supabase
// ============================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tiers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_monthly_pln: number;
          price_yearly_pln: number | null;
          description: string | null;
          benefits: string[] | null;
          sort_order: number;
          active: boolean;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_monthly_pln: number;
          price_yearly_pln?: number | null;
          description?: string | null;
          benefits?: string[] | null;
          sort_order?: number;
          active?: boolean;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price_monthly_pln?: number;
          price_yearly_pln?: number | null;
          description?: string | null;
          benefits?: string[] | null;
          sort_order?: number;
          active?: boolean;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'guest' | 'subscriber' | 'supporter' | 'admin';
          tier_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | null;
          subscription_period_end: string | null;
          subscription_cancel_at_period_end: boolean;
          push_subscription: Json | null;
          email_notifications: boolean;
          push_notifications: boolean;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guest' | 'subscriber' | 'supporter' | 'admin';
          tier_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | null;
          subscription_period_end?: string | null;
          subscription_cancel_at_period_end?: boolean;
          push_subscription?: Json | null;
          email_notifications?: boolean;
          push_notifications?: boolean;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guest' | 'subscriber' | 'supporter' | 'admin';
          tier_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | null;
          subscription_period_end?: string | null;
          subscription_cancel_at_period_end?: boolean;
          push_subscription?: Json | null;
          email_notifications?: boolean;
          push_notifications?: boolean;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          title: string;
          slug: string;
          type: 'video' | 'audio' | 'pdf' | 'post' | 'live';
          visibility: 'public' | 'subscriber' | 'supporter';
          tier_id: string | null;
          excerpt: string | null;
          body_markdown: string | null;
          video_provider: 'youtube' | 'bunny' | 'vimeo' | null;
          video_id: string | null;
          video_signed_url: string | null;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          file_url: string | null;
          file_size_bytes: number | null;
          published_at: string | null;
          scheduled_at: string | null;
          is_featured: boolean;
          view_count: number;
          meta: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          type: 'video' | 'audio' | 'pdf' | 'post' | 'live';
          visibility?: 'public' | 'subscriber' | 'supporter';
          tier_id?: string | null;
          excerpt?: string | null;
          body_markdown?: string | null;
          video_provider?: 'youtube' | 'bunny' | 'vimeo' | null;
          video_id?: string | null;
          video_signed_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          file_url?: string | null;
          file_size_bytes?: number | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          is_featured?: boolean;
          view_count?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          type?: 'video' | 'audio' | 'pdf' | 'post' | 'live';
          visibility?: 'public' | 'subscriber' | 'supporter';
          tier_id?: string | null;
          excerpt?: string | null;
          body_markdown?: string | null;
          video_provider?: 'youtube' | 'bunny' | 'vimeo' | null;
          video_id?: string | null;
          video_signed_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          file_url?: string | null;
          file_size_bytes?: number | null;
          published_at?: string | null;
          scheduled_at?: string | null;
          is_featured?: boolean;
          view_count?: number;
          meta?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content_id: string;
          user_id: string;
          parent_id: string | null;
          body: string;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          user_id: string;
          parent_id?: string | null;
          body: string;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          user_id?: string;
          parent_id?: string | null;
          body?: string;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_events: {
        Row: {
          id: number;
          stripe_event_id: string;
          user_id: string | null;
          type: 'checkout.completed' | 'subscription.created' | 'subscription.updated' | 'subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed' | 'customer.subscription.trial_will_end' | 'manual_grant';
          payload: Json;
          processed_at: string;
        };
        Insert: {
          id?: number;
          stripe_event_id: string;
          user_id?: string | null;
          type: 'checkout.completed' | 'subscription.created' | 'subscription.updated' | 'subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed' | 'customer.subscription.trial_will_end' | 'manual_grant';
          payload: Json;
          processed_at?: string;
        };
        Update: {
          id?: number;
          stripe_event_id?: string;
          user_id?: string | null;
          type?: 'checkout.completed' | 'subscription.created' | 'subscription.updated' | 'subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed' | 'customer.subscription.trial_will_end' | 'manual_grant';
          payload?: Json;
          processed_at?: string;
        };
      };
      content_clicks: {
        Row: {
          id: number;
          content_id: string;
          user_id: string | null;
          referrer: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: number;
          content_id: string;
          user_id?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
        Update: {
          id?: number;
          content_id?: string;
          user_id?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_view_count: {
        Args: { content_id: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: 'guest' | 'subscriber' | 'supporter' | 'admin';
      content_visibility: 'public' | 'subscriber' | 'supporter';
      content_type: 'video' | 'audio' | 'pdf' | 'post' | 'live';
      video_provider: 'youtube' | 'bunny' | 'vimeo';
      subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
      payment_event_type: 'checkout.completed' | 'subscription.created' | 'subscription.updated' | 'subscription.deleted' | 'invoice.payment_succeeded' | 'invoice.payment_failed' | 'customer.subscription.trial_will_end' | 'manual_grant';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
