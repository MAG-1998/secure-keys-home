import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { MagitLogo } from "@/components/MagitLogo"
import { useUserRole } from "@/hooks/useUserRole"
import type { User } from "@supabase/supabase-js"

interface RoleProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: ('user' | 'moderator' | 'admin')[]
}

const RoleProtectedRoute = ({ children, requiredRoles }: RoleProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { role, loading: roleLoading } = useUserRole(user)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setAuthLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!requiredRoles.includes(role)) {
    console.log(`Access denied. User role: ${role}, Required roles: ${requiredRoles.join(', ')}`)
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default RoleProtectedRoute