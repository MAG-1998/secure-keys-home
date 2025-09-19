-- Update the property notification function to handle halal financing approvals and fix property approval notifications
CREATE OR REPLACE FUNCTION public.fn_notify_property_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
      values (new.user_id, 'property:approved', 'Property approved', 'Your property listing has been approved and is now visible to buyers', 'property', new.id);
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
      values (new.user_id, 'property:rejected', 'Property rejected', 'Your property listing was rejected. Please review the feedback and resubmit', 'property', new.id);
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

  -- Halal financing status changes
  if old.halal_status is distinct from new.halal_status then
    if new.halal_status = 'approved' and old.halal_status = 'pending_approval' then
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
      values (new.user_id, 'property:halal_approved', 'Halal financing approved', 'Your property has been approved for Sharia-compliant financing', 'property', new.id);
    elsif new.halal_status = 'denied' and old.halal_status = 'pending_approval' then
      insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
      values (new.user_id, 'property:halal_denied', 'Halal financing denied', 'Your halal financing request has been denied. Contact support for details', 'property', new.id);
    end if;
  end if;

  -- Financing listed - using the new halal_status field
  if (coalesce(old.is_halal_available,false) is distinct from coalesce(new.is_halal_available,false) and new.is_halal_available is true)
     or (coalesce(old.halal_status,'null') in ('null','disabled') and coalesce(new.halal_status,'null') not in ('null','disabled')) then
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
$function$;

-- Function to clean up old notifications (keep only latest 5 per user)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete notifications beyond the latest 5 for each user
  WITH ranked_notifications AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.notifications
  )
  DELETE FROM public.notifications 
  WHERE id IN (
    SELECT id FROM ranked_notifications WHERE rn > 5
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$;