import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, MessageSquare, CalendarClock, CalendarCheck, XCircle, BadgeCheck, ShieldCheck, DollarSign, Home } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const getNotificationTitle = (type: string, title?: string) => {
    // Map notification types to translation keys
    const typeMap: Record<string, string> = {
      'message:new': 'notification.message.new',
      'message:reply': 'notification.message.reply',
      'visit:new': 'notification.visit.new',
      'visit:approved': 'notification.visit.approved',
      'visit:denied': 'notification.visit.denied',
      'visit:proposal': 'notification.visit.proposal',
      'visit:no_show': 'notification.visit.no_show',
      'financing:assigned': 'notification.financing.assigned',
      'financing:approved': 'notification.financing.approved',
      'financing:rejected': 'notification.financing.rejected',
      'financing:documents_required': 'notification.financing.documents_required',
      'financing:under_review': 'notification.financing.under_review',
      'financing:stage_change': 'notification.financing.stage_change',
      'financing:documents_complete': 'notification.financing.documents_complete',
      'financing:final_approval': 'notification.financing.final_approval',
      'financing:sent_back': 'notification.financing.sent_back',
      'property:verified': 'notification.property.verified',
      'property:approved': 'notification.property.approved',
      'property:sold': 'notification.property.sold',
      'property:financing_listed': 'notification.property.financing_listed',
      'saved:new': 'notification.saved.new',
      'support:ticket_new': 'notification.support.ticket_new',
      'support:ticket_escalated': 'notification.support.ticket_escalated',
      'report:new': 'notification.report.new'
    }
    
    const key = typeMap[type]
    if (key) {
      return t(key)
    }
    
    // Handle special cases for database titles that don't map to types
    if (title) {
      const titleMap: Record<string, string> = {
        'Financing Request Assigned': 'notification.financing.assigned',
        'New Financing Request Assigned': 'notification.financing.assigned',
        'Documents Required': 'notification.financing.documents_required',
        'Under Review': 'notification.financing.under_review',
        'Documents Complete': 'notification.financing.documents_complete',
        'Final Approval': 'notification.financing.final_approval',
        'Sent Back': 'notification.financing.sent_back'
      }
      
      const titleKey = titleMap[title]
      if (titleKey) {
        return t(titleKey)
      }
    }
    
    return title || type
  }

  const getNotificationBody = (type: string, body?: string) => {
    // Map notification types to body translation keys
    const bodyMap: Record<string, string> = {
      'message:new': 'notification.body.message.new',
      'visit:new': 'notification.body.visit.new',
      'visit:approved': 'notification.body.visit.approved',
      'visit:denied': 'notification.body.visit.denied',
      'visit:no_show': 'notification.body.visit.no_show',
      'financing:assigned': 'notification.body.financing.assigned',
      'financing:documents_required': 'notification.body.financing.documents_required',
      'financing:stage_change': 'notification.body.financing.stage_change',
      'financing:documents_complete': 'notification.body.financing.documents_complete',
      'financing:final_approval': 'notification.body.financing.final_approval',
      'financing:sent_back': 'notification.body.financing.sent_back',
      'property:verified': 'notification.body.property.verified',
      'support:ticket_new': 'notification.body.support.ticket_new',
      'support:ticket_escalated': 'notification.body.support.ticket_escalated',
      'report:new': 'notification.body.report.new'
    }
    
    const key = bodyMap[type]
    if (key) {
      return t(key)
    }
    
    // For dynamic content like visit times or message content, return the original body
    if (body && (type.includes('visit') || type.includes('message'))) {
      return body
    }
    
    return ''
  }

  const goTo = (type: string, entityId: string | null) => {
    if (type.startsWith('message:')) return '/visit-requests'
    if (type.startsWith('visit:')) {
      if (type === 'visit:new') return '/visit-requests'
      return '/my-requests'
    }
    if (type.startsWith('financing:')) {
      return entityId ? `/my-financing/${entityId}` : '/my-financing'
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
    if (type === 'visit:no_show') return <XCircle className="h-4 w-4" />
    if (type.startsWith('financing:')) return <DollarSign className="h-4 w-4" />
    if (type === 'property:verified') return <ShieldCheck className="h-4 w-4" />
    if (type === 'property:approved') return <BadgeCheck className="h-4 w-4" />
    if (type === 'property:sold') return <Home className="h-4 w-4" />
    if (type === 'property:financing_listed') return <DollarSign className="h-4 w-4" />
    if (type.startsWith('saved:')) return <Home className="h-4 w-4" />
    if (type.startsWith('support:')) return <MessageSquare className="h-4 w-4" />
    if (type.startsWith('report:')) return <Bell className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] w-80 p-0 bg-popover">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <DropdownMenuLabel>{t('notifications.title')}</DropdownMenuLabel>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => markAllAsRead()}>
            {t('notifications.markAllAsRead')}
          </Button>
        </div>
        {notifications.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">{t('notifications.allCaughtUp')}</div>
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
              <div className="text-sm font-medium text-foreground">{getNotificationTitle(n.type, n.title)}</div>
              {(getNotificationBody(n.type, n.body) || n.body) && (
                <div className="text-xs text-muted-foreground">
                  {getNotificationBody(n.type, n.body) || n.body}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </DropdownMenuItem>
        ))}
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-muted-foreground">{t('notifications.showingLatest')} {Math.min(10, notifications.length)} {t('notifications.of')} {notifications.length}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}