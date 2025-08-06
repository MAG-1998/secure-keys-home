import { Navigate } from "react-router-dom"
import { MagitLogo } from "@/components/MagitLogo"
import { useUser } from "@/contexts/UserContext"

interface RoleProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: ('user' | 'moderator' | 'admin')[]
}

const RoleProtectedRoute = ({ children, requiredRoles }: RoleProtectedRouteProps) => {
  const { user, role, loading } = useUser()

  if (loading) {
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