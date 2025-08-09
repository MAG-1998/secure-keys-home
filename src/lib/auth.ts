export const SUPABASE_STORAGE_KEY = 'sb-mvndmnkgtoygsvesktgw-auth-token';
const ROLE_CACHE_KEY = 'magit_user_role';
const ROLE_CACHE_EXPIRY_KEY = 'magit_user_role_expiry';

export async function forceLocalSignOut() {
  try {
    // Best effort local sign out
    const supabaseAuth = (await import('@/integrations/supabase/client')).supabase.auth;
    try { await supabaseAuth.signOut({ scope: 'local' } as any); } catch {}
  } catch {}

  try { localStorage.removeItem(SUPABASE_STORAGE_KEY); } catch {}
  try { localStorage.removeItem(ROLE_CACHE_KEY); } catch {}
  try { localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY); } catch {}

  try { sessionStorage.clear(); } catch {}
}
