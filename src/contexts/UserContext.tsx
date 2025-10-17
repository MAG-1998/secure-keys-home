import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Role caching utilities
const ROLE_CACHE_KEY = 'magit_user_role';
const ROLE_CACHE_EXPIRY_KEY = 'magit_user_role_expiry';
const PROFILE_NAME_CACHE_KEY = 'magit_user_profile_name';
const PROFILE_NAME_CACHE_EXPIRY_KEY = 'magit_user_profile_name_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type UserRole = 'user' | 'moderator' | 'admin';

const setCachedRole = (role: UserRole) => {
  try {
    localStorage.setItem(ROLE_CACHE_KEY, role);
    localStorage.setItem(ROLE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    console.log(`Role cached: ${role}`);
  } catch (error) {
    console.warn('Failed to cache role:', error);
  }
};

const getCachedRole = (): UserRole | null => {
  try {
    const expiry = localStorage.getItem(ROLE_CACHE_EXPIRY_KEY);
    if (!expiry || Date.now() > parseInt(expiry)) {
      clearCachedRole();
      return null;
    }
    const role = localStorage.getItem(ROLE_CACHE_KEY) as UserRole | null;
    if (role && ['user', 'moderator', 'admin'].includes(role)) {
      console.log(`Using cached role: ${role}`);
      return role;
    }
    return null;
  } catch (error) {
    console.warn('Failed to get cached role:', error);
    return null;
  }
};

const clearCachedRole = () => {
  try {
    localStorage.removeItem(ROLE_CACHE_KEY);
    localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
    console.log('Role cache cleared');
  } catch (error) {
    console.warn('Failed to clear role cache:', error);
  }
};

const setCachedProfileName = (name: string) => {
  try {
    localStorage.setItem(PROFILE_NAME_CACHE_KEY, name);
    localStorage.setItem(PROFILE_NAME_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  } catch (error) {
    console.warn('Failed to cache profile name:', error);
  }
};

const getCachedProfileName = (): string | null => {
  try {
    const expiry = localStorage.getItem(PROFILE_NAME_CACHE_EXPIRY_KEY);
    if (!expiry || Date.now() > parseInt(expiry)) {
      clearCachedProfileName();
      return null;
    }
    return localStorage.getItem(PROFILE_NAME_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to get cached profile name:', error);
    return null;
  }
};

const clearCachedProfileName = () => {
  try {
    localStorage.removeItem(PROFILE_NAME_CACHE_KEY);
    localStorage.removeItem(PROFILE_NAME_CACHE_EXPIRY_KEY);
  } catch (error) {
    console.warn('Failed to clear profile name cache:', error);
  }
};

interface UserContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  profileName: string | null;
  loading: boolean;
  authLoading: boolean;
  roleLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [profileName, setProfileName] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  const loading = authLoading || roleLoading;

  // Fetch user role and profile name with retry logic and caching
  const fetchUserRole = async (userId: string, retryCount = 0): Promise<void> => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    try {
      console.log(`Fetching profile data for user ${userId} (attempt ${retryCount + 1})`);
      setRoleLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - user role
          console.log(`No profile found for user ${userId}, defaulting to user role`);
          setRole('user');
          setCachedRole('user');
          setProfileName(null);
        } else {
          throw error;
        }
      } else {
        const userRole = (data?.role as UserRole) || 'user';
        const fullName = data?.full_name || null;
        console.log(`Profile data fetched: role=${userRole}, name=${fullName}`);
        setRole(userRole);
        setCachedRole(userRole);
        setProfileName(fullName);
        if (fullName) setCachedProfileName(fullName);
      }
    } catch (error) {
      console.error(`Error fetching profile data (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying profile fetch in ${delay}ms...`);
        setTimeout(() => {
          fetchUserRole(userId, retryCount + 1);
        }, delay);
        return; // Don't set roleLoading to false yet
      } else {
        // All retries failed - use cached role or default to user
        const cachedRole = getCachedRole();
        const cachedName = getCachedProfileName();
        const fallbackRole = cachedRole || 'user';
        console.warn(`All fetch attempts failed, using fallback: role=${fallbackRole}, name=${cachedName}`);
        setRole(fallbackRole);
        setProfileName(cachedName);
      }
    } finally {
      // Only set loading to false if this is the final attempt or successful
      if (retryCount === 0 || retryCount >= maxRetries) {
        setRoleLoading(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);

        if (session?.user) {
          // Enforce ban immediately
          try {
            const email = session.user.email || null;
            const phone = (session.user.user_metadata as any)?.phone || null;
            if (email || phone) {
              const orParts = [email ? `email.eq.${email}` : null, phone ? `phone.eq.${phone}` : null].filter(Boolean).join(',');
              const { data: banned } = await supabase
                .from('red_list')
                .select('id, reason')
                .or(orParts)
                .maybeSingle();
              if (banned) {
                try { localStorage.setItem('magit_ban_reason', banned.reason || 'Banned'); } catch {}
                await supabase.auth.signOut();
                window.location.replace('/auth?banned=1');
                return;
              }
            }
          } catch {}

          // Try to use cached role and name first for immediate UI update
          const cachedRole = getCachedRole();
          const cachedName = getCachedProfileName();
          if (cachedRole) {
            console.log(`Using cached role for immediate display: ${cachedRole}`);
            setRole(cachedRole);
          }
          if (cachedName) {
            console.log(`Using cached name for immediate display: ${cachedName}`);
            setProfileName(cachedName);
          }
          
          // Fetch fresh role and profile data
          await fetchUserRole(session.user.id);
        } else {
          console.log('No session found, clearing role and profile name');
          setRole('user');
          setProfileName(null);
          setRoleLoading(false);
          clearCachedRole();
          clearCachedProfileName();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setAuthLoading(false);
          setRoleLoading(false);
          setRole('user');
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);

        if (session?.user) {
          // Try to use cached role and name first for immediate UI update
          const cachedRole = getCachedRole();
          const cachedName = getCachedProfileName();
          if (cachedRole) {
            console.log(`Using cached role after auth change: ${cachedRole}`);
            setRole(cachedRole);
          }
          if (cachedName) {
            setProfileName(cachedName);
          }
          
          // Fetch fresh role and profile data
          fetchUserRole(session.user.id);
        } else {
          console.log('Session ended, clearing role and profile name');
          setRole('user');
          setProfileName(null);
          setRoleLoading(false);
          clearCachedRole();
          clearCachedProfileName();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: UserContextType = {
    user,
    session,
    role,
    profileName,
    loading,
    authLoading,
    roleLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};