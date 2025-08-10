
-- 1) Ensure the enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND pg_type.typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END
$$;

-- 2) Ensure profiles.role uses the enum and has the correct default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
      AND udt_name <> 'app_role'
  ) THEN
    ALTER TABLE public.profiles 
      ALTER COLUMN role TYPE public.app_role 
      USING CASE 
        WHEN role IN ('admin','moderator','user') THEN role::public.app_role 
        ELSE 'user'::public.app_role 
      END;
  END IF;
END
$$;

ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- 3) Recreate has_role with fully-qualified enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- 4) Recreate assign_role with fully-qualified enum
CREATE OR REPLACE FUNCTION public.assign_role(target_user_id uuid, new_role public.app_role, changed_by_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_role_text text;
BEGIN
  SELECT role::text INTO old_role_text
  FROM public.profiles
  WHERE user_id = target_user_id;

  UPDATE public.profiles
  SET role = new_role
  WHERE user_id = target_user_id;

  INSERT INTO public.role_audit_log (
    user_id, target_user_id, changed_by, old_role, new_role, action
  ) VALUES (
    target_user_id, target_user_id, changed_by_user_id, old_role_text, new_role::text, 'role_change'
  );

  RETURN true;
END;
$function$;

-- 5) Recreate setup_test_account with fully-qualified enum
CREATE OR REPLACE FUNCTION public.setup_test_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.email IN ('admin@example.com', 'moderator@example.com') THEN
    INSERT INTO public.profiles (user_id, email, full_name, user_type, role)
    VALUES (
      NEW.id, 
      NEW.email, 
      CASE 
        WHEN NEW.email = 'admin@example.com' THEN 'Admin User'
        WHEN NEW.email = 'moderator@example.com' THEN 'Moderator User'
      END, 
      'buyer',
      CASE 
        WHEN NEW.email = 'admin@example.com' THEN 'admin'::public.app_role
        WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::public.app_role
      END
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 6) Recreate handle_new_user with fully-qualified enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'::public.app_role
      WHEN NEW.email = 'moderator@example.com' THEN 'moderator'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 7) Recreate delete_user_account to qualify enum casts
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_role_text text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can delete user accounts';
  END IF;

  SELECT role::text INTO old_role_text
  FROM public.profiles
  WHERE user_id = target_user_id;

  DELETE FROM public.profiles WHERE user_id = target_user_id;

  INSERT INTO public.role_audit_log (
    user_id, target_user_id, changed_by, old_role, new_role, action
  ) VALUES (
    target_user_id, target_user_id, auth.uid(),
    old_role_text,
    'deleted',
    'account_deletion'
  );

  RETURN true;
END;
$function$;
