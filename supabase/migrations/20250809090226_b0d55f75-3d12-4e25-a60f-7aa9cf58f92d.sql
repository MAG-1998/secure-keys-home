-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies (no IF NOT EXISTS due to Postgres limitation)
create policy "Users can view their notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- Indexes
create index if not exists idx_notifications_user_unread on public.notifications (user_id, read_at);
create index if not exists idx_notifications_user_created_at on public.notifications (user_id, created_at desc);

-- Realtime settings
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notifications;

-- Function: notify on new message
create or replace function public.fn_notify_new_message()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, data)
  values (
    new.recipient_id,
    'message:new',
    'New message',
    left(coalesce(new.content, ''), 140),
    'message',
    new.id,
    jsonb_build_object('sender_id', new.sender_id, 'property_id', new.property_id)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger for messages insert
create trigger trg_notify_new_message
after insert on public.messages
for each row execute function public.fn_notify_new_message();

-- Function: notify on new visit request (to owner)
create or replace function public.fn_notify_visit_insert()
returns trigger as $$
declare
  owner_id uuid;
begin
  select p.user_id into owner_id from public.properties p where p.id = new.property_id;
  if owner_id is not null and owner_id <> new.visitor_id then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    values (
      owner_id,
      'visit:new',
      'New visit request',
      to_char(new.visit_date, 'YYYY-MM-DD HH24:MI'),
      'visit',
      new.id,
      jsonb_build_object('property_id', new.property_id, 'visitor_id', new.visitor_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger trg_notify_visit_insert
after insert on public.property_visits
for each row execute function public.fn_notify_visit_insert();

-- Function: notify on visit updates (to visitor)
create or replace function public.fn_notify_visit_update()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' then
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      values (new.visitor_id, 'visit:approved', 'Visit approved', null, 'visit', new.id, jsonb_build_object('property_id', new.property_id));
    elsif new.status = 'denied' then
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id, data)
      values (new.visitor_id, 'visit:denied', 'Visit denied', null, 'visit', new.id, jsonb_build_object('property_id', new.property_id));
    end if;
  elsif new.visit_date is distinct from old.visit_date or (coalesce(new.is_custom_time,false) and (coalesce(old.is_custom_time,false) is distinct from coalesce(new.is_custom_time,false))) then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id, data)
    values (new.visitor_id, 'visit:proposal', 'Alternative visit time proposed', to_char(new.visit_date, 'YYYY-MM-DD HH24:MI'), 'visit', new.id, jsonb_build_object('property_id', new.property_id));
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger trg_notify_visit_update
after update on public.property_visits
for each row execute function public.fn_notify_visit_update();

-- Function: notify on property updates
create or replace function public.fn_notify_property_update()
returns trigger as $$
declare
  financing_listed boolean := false;
begin
  -- Verified
  if coalesce(old.is_verified,false) is distinct from coalesce(new.is_verified,false) and new.is_verified is true then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (new.user_id, 'property:verified', 'Property verified', null, 'property', new.id);
  end if;

  -- Moderation status changes
  if new.status is distinct from old.status then
    if new.status = 'approved' then
      insert into public.notifications (user_id, type, title, entity_type, entity_id)
      values (new.user_id, 'property:approved', 'Property approved', 'property', new.id);
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, entity_type, entity_id)
      values (new.user_id, 'property:rejected', 'Property rejected', 'property', new.id);
    elsif new.status = 'sold' then
      -- Notify owner
      insert into public.notifications (user_id, type, title, entity_type, entity_id)
      values (new.user_id, 'property:sold', 'Your property was marked as sold', 'property', new.id);
      -- Notify watchers
      insert into public.notifications (user_id, type, title, entity_type, entity_id, data)
      select sp.user_id, 'saved:sold', 'Saved property is sold', 'property', new.id, jsonb_build_object('saved_id', sp.id)
      from public.saved_properties sp
      where sp.property_id = new.id and sp.user_id <> new.user_id;
    end if;
  end if;

  -- Financing listed
  if (coalesce(old.is_halal_financed,false) is distinct from coalesce(new.is_halal_financed,false) and new.is_halal_financed is true)
     or (coalesce(old.halal_financing_status,'none') in ('none','denied') and coalesce(new.halal_financing_status,'none') not in ('none','denied')) then
    financing_listed := true;
  end if;

  if financing_listed then
    -- Owner
    insert into public.notifications (user_id, type, title, entity_type, entity_id)
    values (new.user_id, 'property:financing_listed', 'Property listed for financing', 'property', new.id);
    -- Watchers
    insert into public.notifications (user_id, type, title, entity_type, entity_id, data)
    select sp.user_id, 'saved:financing_listed', 'Saved property listed for financing', 'property', new.id, jsonb_build_object('saved_id', sp.id)
    from public.saved_properties sp
    where sp.property_id = new.id and sp.user_id <> new.user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger trg_notify_property_update
after update on public.properties
for each row execute function public.fn_notify_property_update();