import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useUser } from '@/contexts/UserContext'

export type AppNotification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  data: any
  read_at: string | null
  created_at: string
}

export function useNotifications(limit = 25) {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  const userId = user?.id

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    setNotifications(data || [])
    setLoading(false)
  }, [userId, limit])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newRow = payload.new as AppNotification
          setNotifications((prev) => [newRow, ...prev].slice(0, limit))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, limit])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications])

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null).eq('user_id', userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
  }, [userId])

  return { notifications, unreadCount, loading, refetch: fetchNotifications, markAsRead, markAllAsRead }
}
