-- ============================================
-- BEZ MASKI - Row Level Security Policies (v2)
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
-- PROFILES: users read own, admins read all
-- ============================================

create policy "Users read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Admins read all profiles"
on profiles for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

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
-- Higher tier (higher sort_order) grants access to lower tier content
create policy "Supporter content for active tier with hierarchy"
on content for select
using (
  visibility = 'supporter'
  and auth.uid() is not null
  and exists (
    select 1 from profiles p
    join tiers t_user on t_user.id = p.tier_id
    join tiers t_content on t_content.id = content.tier_id
    where p.id = auth.uid()
    and p.role = 'supporter'
    and p.subscription_status = 'active'
    and t_user.active = true
    and t_content.active = true
    and (
      -- Same tier access
      p.tier_id = content.tier_id
      OR
      -- Higher tier (higher sort_order) grants access to lower tier content
      t_user.sort_order >= t_content.sort_order
    )
  )
);

-- 4. Admins see everything
create policy "Admins read all content"
on content for select
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

-- 5. Service role for Edge Functions
create policy "Service role full access to content"
on content for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 6. Authenticated users (subscriber+) can insert/update own content? No - only admins
-- Admins manage content
create policy "Admins insert content"
on content for insert
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create policy "Admins update content"
on content for update
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create policy "Admins delete content"
on content for delete
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

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
        and exists (
          select 1 from profiles p
          join tiers t_user on t_user.id = p.tier_id
          join tiers t_content on t_content.id = c.tier_id
          where p.id = auth.uid()
          and p.role = 'supporter'
          and p.subscription_status = 'active'
          and t_user.active = true
          and t_content.active = true
          and (p.tier_id = c.tier_id or t_user.sort_order >= t_content.sort_order)
        )
      )
      or exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
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
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

-- ============================================
-- PAYMENT_EVENTS: Service role only (audit log)
-- ============================================

create policy "Service role full access to payment_events"
on payment_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Users can see their own payment events (optional, for transparency)
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