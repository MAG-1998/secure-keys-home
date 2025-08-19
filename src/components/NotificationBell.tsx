import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, MessageSquare, CalendarClock, CalendarCheck, XCircle, BadgeCheck, ShieldCheck, DollarSign, Home } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useNavigate } from 'react-router-dom'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()

  const goTo = (type: string, entityId: string | null) => {
    if (type.startsWith('message:')) return '/visit-requests'
    if (type.startsWith('visit:')) {
      if (type === 'visit:new') return '/visit-requests'
      return '/my-requests'
    }
    if (type.startsWith('property:')) {
      return entityId ? `/property/${entityId}` : '/my-properties'
    }
    if (type.startsWith('saved:')) {
      return entityId ? `/property/${entityId}` : '/saved-properties'
    }
    return '/'
  }

  const iconFor = (type: string) => {
    if (type.startsWith('message:')) return <MessageSquare className="h-4 w-4" />
    if (type === 'visit:new') return <CalendarClock className="h-4 w-4" />
    if (type === 'visit:approved') return <CalendarCheck className="h-4 w-4" />
    if (type === 'visit:denied') return <XCircle className="h-4 w-4" />
    if (type === 'visit:proposal') return <CalendarClock className="h-4 w-4" />
    if (type === 'property:verified') return <ShieldCheck className="h-4 w-4" />
    if (type === 'property:approved') return <BadgeCheck className="h-4 w-4" />
    if (type === 'property:sold') return <Home className="h-4 w-4" />
    if (type === 'property:financing_listed') return <DollarSign className="h-4 w-4" />
    if (type.startsWith('saved:')) return <Home className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {unreadCount}
              </span>
              <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] w-80 p-0 bg-popover">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        </div>
        {notifications.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">You're all caught up.</div>
        )}
        {notifications.slice(0, 10).map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex items-start gap-3 py-3 px-3 relative ${!n.read_at ? 'bg-muted/40' : ''}`}
            onClick={async () => {
              await markAsRead(n.id)
              navigate(goTo(n.type, n.entity_id))
            }}
          >
            {!n.read_at && (
              <div className="absolute left-2 top-4 w-2 h-2 bg-green-500 rounded-full" />
            )}
            <div className={`mt-0.5 ${!n.read_at ? 'ml-2' : ''}`}>{iconFor(n.type)}</div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">{n.title}</div>
              {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
              <div className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </DropdownMenuItem>
        ))}
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-muted-foreground">Showing latest {Math.min(10, notifications.length)} of {notifications.length}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
