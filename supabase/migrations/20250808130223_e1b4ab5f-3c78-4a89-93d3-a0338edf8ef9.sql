-- Backfill properties based on approved halal financing requests
UPDATE public.properties p
SET is_halal_financed = true,
    halal_financing_status = 'approved'
WHERE EXISTS (
  SELECT 1 FROM public.halal_financing_requests r
  WHERE r.property_id = p.id AND r.status = 'approved'
);
