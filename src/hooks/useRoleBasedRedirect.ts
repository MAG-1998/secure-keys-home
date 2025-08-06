import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserRole } from './useUserRole'
import type { User } from '@supabase/supabase-js'

export const useRoleBasedRedirect = (user: User | null) => {
  const navigate = useNavigate()
  const { role, loading } = useUserRole(user)

  useEffect(() => {
    if (!loading && user && role) {
      // Redirect based on user role
      switch (role) {
        case 'admin':
          navigate('/admin', { replace: true })
          break
        case 'moderator':
          navigate('/moderator', { replace: true })
          break
        case 'user':
        default:
          navigate('/dashboard', { replace: true })
          break
      }
    }
  }, [user, role, loading, navigate])

  return { role, loading }
}