-- ============================================
-- BEZ MASKI - Row Level Security Policies (v2) - POPRAWIONY
-- Używa funkcji SECURITY DEFINER zamiast zapytań do profiles
-- ============================================

-- Enable RLS on all tables
alter table tiers enable row level security;
alter table profiles enable row level security;
alter table content enable row level security;
alter table comments enable row level security;
alter table payment_events enable row level security;
alter table content_clicks enable row level security;

-- ============================================
-- TIERS: public read for active tiers
-- ============================================

create policy "Active tiers readable by all"
on tiers for select
using (active = true);

-- ============================================
-- PROFILES: users read own, admins read all (BEZ REKURENCJI)
-- ============================================

create policy "Users read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Admins read all profiles"
on profiles for select
using (public.is_admin());

create policy "Users update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Service role (Edge Functions) can do everything
create policy "Service role full access to profiles"
on profiles for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- ============================================
-- CONTENT: Core RLS - server-side access control
-- ============================================

-- 1. Public content - everyone (including anonymous)
create policy "Public content readable by all"
on content for select
using (visibility = 'public');

-- 2. Subscriber content - authenticated users only
create policy "Subscriber content for authenticated users"
on content for select
using (
  visibility = 'subscriber'
  and auth.uid() is not null
);

-- 3. Supporter content - tier-based access with hierarchy
-- Używa funkcji SECURITY DEFINER
create policy "Supporter content for active tier with hierarchy"
on content for select
using (
  visibility = 'supporter'
  and auth.uid() is not null
  and public.is_active_supporter()
  and (
    -- Same tier access
    (select tier_id from public.profiles where id = auth.uid()) = content.tier_id
    OR
    -- Higher tier (higher sort_order) grants access to lower tier content
    public.current_user_tier_sort_order() >= (
      select sort_order from public.tiers where id = content.tier_id
    )
  )
);

-- 4. Admins see everything (BEZ REKURENCJI)
create policy "Admins read all content"
on content for select
using (public.is_admin());

-- 5. Service role for Edge Functions
create policy "Service role full access to content"
on content for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 6. Admins manage content (BEZ REKURENCJI)
create policy "Admins insert content"
on content for insert
with check (public.is_admin());

create policy "Admins update content"
on content for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins delete content"
on content for delete
using (public.is_admin());

-- ============================================
-- COMMENTS: Subscriber+ can read, Subscriber+ can write
-- ============================================

create policy "Comments readable by content visibility rules"
on comments for select
using (
  exists (
    select 1 from content c
    where c.id = comments.content_id
    and (
      c.visibility = 'public'
      or (c.visibility = 'subscriber' and auth.uid() is not null)
      or (
        c.visibility = 'supporter'
        and auth.uid() is not null
        and public.is_active_supporter()
        and (
          (select tier_id from public.profiles where id = auth.uid()) = c.tier_id
          OR
          public.current_user_tier_sort_order() >= (
            select sort_order from public.tiers where id = c.tier_id
          )
        )
      )
      or public.is_admin()
    )
  )
);

create policy "Authenticated users insert comments"
on comments for insert
with check (
  auth.uid() is not null
  and auth.uid() = user_id
);

create policy "Users update own comments"
on comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users delete own comments"
on comments for delete
using (auth.uid() = user_id);

create policy "Admins manage all comments"
on comments for all
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- PAYMENT_EVENTS: Service role only (audit log)
-- ============================================

create policy "Service role full access to payment_events"
on payment_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Users read own payment events"
on payment_events for select
using (auth.uid() = user_id);

-- ============================================
-- CONTENT_CLICKS: Service role + own clicks
-- ============================================

create policy "Service role full access to content_clicks"
on content_clicks for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Users read own clicks"
on content_clicks for select
using (auth.uid() = user_id);