import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserRole } from './useUserRole'
import type { User } from '@supabase/supabase-js'

export const useRoleBasedRedirect = (user: User | null, shouldRedirect: boolean = false) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, loading } = useUserRole(user)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Only redirect if explicitly requested (like on login) and haven't redirected before
    if (!loading && user && role && shouldRedirect && !hasRedirected.current) {
      // Don't redirect if already on the correct page
      const targetPath = role === 'admin' ? '/admin' : role === 'moderator' ? '/moderator' : '/dashboard'
      
      if (location.pathname !== targetPath) {
        hasRedirected.current = true
        navigate(targetPath, { replace: true })
      }
    }
  }, [user, role, loading, navigate, location.pathname, shouldRedirect])

  // Reset redirect flag when user changes
  useEffect(() => {
    hasRedirected.current = false
  }, [user?.id])

  return { role, loading }
}