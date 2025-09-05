-- Fix URL inconsistency and create a comprehensive photo migration system
-- First, let's create a function to standardize all photo URLs to relative format
CREATE OR REPLACE FUNCTION public.standardize_photo_urls()
RETURNS TABLE(property_id uuid, updated_photos_count integer, updated_image_url boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prop_record RECORD;
    photo_record jsonb;
    updated_photos jsonb;
    updated_image_url_text text;
    photo_count integer := 0;
    image_url_updated boolean := false;
BEGIN
    FOR prop_record IN 
        SELECT id, photos, image_url 
        FROM properties 
        WHERE photos IS NOT NULL OR image_url IS NOT NULL
    LOOP
        updated_photos := '[]'::jsonb;
        photo_count := 0;
        image_url_updated := false;
        
        -- Process photos array
        IF prop_record.photos IS NOT NULL THEN
            FOR photo_record IN SELECT value FROM jsonb_array_elements(prop_record.photos)
            LOOP
                DECLARE
                    photo_url text := photo_record #>> '{}';
                    clean_url text;
                BEGIN
                    -- Convert full URLs to relative paths
                    IF photo_url LIKE '%storage/v1/object/public/properties/%' THEN
                        clean_url := '/storage/v1/object/public/properties/' || 
                                   split_part(photo_url, '/storage/v1/object/public/properties/', 2);
                        photo_count := photo_count + 1;
                    ELSE
                        clean_url := photo_url;
                    END IF;
                    
                    updated_photos := updated_photos || to_jsonb(clean_url);
                END;
            END LOOP;
        END IF;
        
        -- Process image_url
        updated_image_url_text := prop_record.image_url;
        IF prop_record.image_url IS NOT NULL AND prop_record.image_url LIKE '%storage/v1/object/public/properties/%' THEN
            updated_image_url_text := '/storage/v1/object/public/properties/' || 
                                    split_part(prop_record.image_url, '/storage/v1/object/public/properties/', 2);
            image_url_updated := true;
        END IF;
        
        -- Update the property if any changes were made
        IF photo_count > 0 OR image_url_updated THEN
            UPDATE properties 
            SET 
                photos = updated_photos,
                image_url = updated_image_url_text,
                updated_at = now()
            WHERE id = prop_record.id;
        END IF;
        
        RETURN QUERY SELECT prop_record.id, photo_count, image_url_updated;
    END LOOP;
END;
$$;

-- Create a function to backup photo URLs before migration
CREATE OR REPLACE FUNCTION public.backup_photo_urls()
RETURNS TABLE(backup_id uuid, properties_backed_up integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    backup_uuid uuid := gen_random_uuid();
    prop_count integer := 0;
BEGIN
    -- Create backup table if it doesn't exist
    CREATE TABLE IF NOT EXISTS photo_url_backups (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        backup_id uuid NOT NULL,
        property_id uuid NOT NULL,
        original_photos jsonb,
        original_image_url text,
        created_at timestamp with time zone DEFAULT now()
    );
    
    -- Backup current photo URLs
    INSERT INTO photo_url_backups (backup_id, property_id, original_photos, original_image_url)
    SELECT 
        backup_uuid,
        id,
        photos,
        image_url
    FROM properties 
    WHERE photos IS NOT NULL OR image_url IS NOT NULL;
    
    GET DIAGNOSTICS prop_count = ROW_COUNT;
    
    RETURN QUERY SELECT backup_uuid, prop_count;
END;
$$;

-- Create a function to restore from backup
CREATE OR REPLACE FUNCTION public.restore_photo_urls(backup_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    restored_count integer := 0;
BEGIN
    UPDATE properties 
    SET 
        photos = b.original_photos,
        image_url = b.original_image_url,
        updated_at = now()
    FROM photo_url_backups b
    WHERE properties.id = b.property_id 
    AND b.backup_id = backup_uuid;
    
    GET DIAGNOSTICS restored_count = ROW_COUNT;
    
    RETURN restored_count;
END;
$$;