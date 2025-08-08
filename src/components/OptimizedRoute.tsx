import { Navigate } from "react-router-dom"
import { MagitLogo } from "@/components/MagitLogo"
import { useUser } from "@/contexts/UserContext"
import { useRoutePreloader } from "@/hooks/useRoutePreloader"
import { memo } from "react"

interface OptimizedRouteProps {
  children: React.ReactNode
  requiredRoles?: ('user' | 'moderator' | 'admin')[]
  requireAuth?: boolean
}

const OptimizedRoute = memo(({ children, requiredRoles, requireAuth = true }: OptimizedRouteProps) => {
  const { user, role, loading } = useUser()
  

  // Preload data for authenticated users (non-blocking)
  try {
    useRoutePreloader()
  } catch (error) {
    console.error('Route preloader error:', error);
  }

  // Show loading while auth/role resolving
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" isLoading={true} />
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mx-auto mt-4"></div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground/70">
            If this takes too long, please refresh the page
          </div>
        </div>
      </div>
    )
  }

  // Auth check
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />
  }

  // Role check
  if (requiredRoles && !requiredRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
})

OptimizedRoute.displayName = "OptimizedRoute"

export default OptimizedRoute