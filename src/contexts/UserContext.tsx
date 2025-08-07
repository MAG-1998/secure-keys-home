import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  session: Session | null;
  role: 'user' | 'moderator' | 'admin';
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
  const [role, setRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  const loading = authLoading || roleLoading;

  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      setRoleLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        // Set default role and continue instead of staying in loading state
        setRole('user');
      } else {
        const userRole = data?.role || 'user';
        setRole(userRole);
        console.log(`User role fetched: ${userRole} for user ${userId}`);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Set default role and continue instead of staying in loading state
      setRole('user');
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Emergency timeout to prevent infinite loading (10 seconds max)
    const emergencyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Emergency timeout: forcing auth loading to complete');
        setAuthLoading(false);
        setRoleLoading(false);
      }
    }, 10000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);

        if (session?.user) {
          // Add timeout for role fetching
          const roleTimeout = setTimeout(() => {
            if (mounted) {
              console.warn('Role fetch timeout: defaulting to user role');
              setRole('user');
              setRoleLoading(false);
            }
          }, 5000);
          
          try {
            await fetchUserRole(session.user.id);
            clearTimeout(roleTimeout);
          } catch (error) {
            clearTimeout(roleTimeout);
            console.error('Role fetch failed:', error);
            setRole('user');
            setRoleLoading(false);
          }
        } else {
          setRole('user');
          setRoleLoading(false);
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
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);

        if (session?.user) {
          // Add timeout for role fetching in auth state change
          const roleTimeout = setTimeout(() => {
            if (mounted) {
              console.warn('Role fetch timeout in auth change: defaulting to user role');
              setRole('user');
              setRoleLoading(false);
            }
          }, 5000);
          
          try {
            await fetchUserRole(session.user.id);
            clearTimeout(roleTimeout);
          } catch (error) {
            clearTimeout(roleTimeout);
            console.error('Role fetch failed in auth change:', error);
            setRole('user');
            setRoleLoading(false);
          }
        } else {
          setRole('user');
          setRoleLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, []);

  const value: UserContextType = {
    user,
    session,
    role,
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