import { NavLink, useLocation } from "react-router-dom"
import { Shield, Users, FileCheck, Settings, Home } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser } from "@/contexts/UserContext"

export function AppSidebar() {
  const { state } = useSidebar() // state is 'expanded' or 'collapsed'
  const location = useLocation()
  const { role } = useUser()
  const currentPath = location.pathname

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"

  // Define navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: Home }
    ]

    if (role === 'admin') {
      return [
        ...baseItems,
        { title: "Admin Panel", url: "/admin", icon: Shield },
        { title: "Review Applications", url: "/moderator", icon: FileCheck },
        { title: "User Management", url: "/admin", icon: Users },
      ]
    }

    if (role === 'moderator') {
      return [
        ...baseItems,
        { title: "Review Applications", url: "/moderator", icon: FileCheck },
        { title: "Property Management", url: "/moderator", icon: Settings },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()
  const hasActiveItem = navigationItems.some(item => currentPath === item.url)

  // Only show sidebar for admin and moderator roles
  if (role !== 'admin' && role !== 'moderator') {
    return null
  }
  
  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role === 'admin' ? 'Admin Tools' : 'Moderator Tools'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}