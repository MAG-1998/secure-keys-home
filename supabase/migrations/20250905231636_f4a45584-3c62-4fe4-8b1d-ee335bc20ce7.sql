-- Fix the property update trigger to remove references to deleted fields
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

-- Now convert all disabled halal status to null
UPDATE public.properties 
SET halal_status = NULL 
WHERE halal_status = 'disabled';