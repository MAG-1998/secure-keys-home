import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Check, CheckCheck, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  _localStatus?: 'sending' | 'error';
  _tempId?: string;
}

interface Conversation {
  userId: string;
  lastMessage?: Message;
  profile?: { full_name?: string; email?: string };
}

export default function MessagesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await fetchConversations();
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (!user) return;
        if (msg.sender_id === user.id || msg.recipient_id === user.id) {
          fetchConversations();
          const otherId = selectedUserId;
          const belongsToOpen =
            !!otherId && ((msg.sender_id === user.id && msg.recipient_id === otherId) || (msg.sender_id === otherId && msg.recipient_id === user.id));
          if (belongsToOpen) {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            if (msg.recipient_id === user.id) {
              // Mark as read if I'm viewing the thread
              markThreadAsRead(otherId!);
            }
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=eq.${user?.id}` }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read_at: msg.read_at } : m)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at, read_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    if (error) return;

    const convMap = new Map<string, Conversation>();
    (data || []).forEach((m) => {
      const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, { userId: otherId, lastMessage: m });
    });

    const userIds = Array.from(convMap.keys());
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      const byId: Record<string, any> = {};
      (profs || []).forEach((p) => { byId[p.user_id] = p; });
      const convs = Array.from(convMap.values()).map((c) => ({
        ...c,
        profile: byId[c.userId]
      }));
      setConversations(convs);
      // Auto-select first conversation
      if (!selectedUserId && convs[0]) {
        setSelectedUserId(convs[0].userId);
      }
    } else {
      setConversations([]);
    }
  };

  const fetchMessagesWith = async (otherId: string) => {
    if (!user) return;
    setSelectedUserId(otherId);
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at, read_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    if (!error) setMessages(data || []);
    await markThreadAsRead(otherId);
  };

  const markThreadAsRead = async (otherId: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    try {
      await supabase
        .from('messages')
        .update({ read_at: now } as any)
        .is('read_at', null)
        .eq('recipient_id', user.id)
        .eq('sender_id', otherId);
    } catch {}
    setMessages((prev) => prev.map((m) => (m.sender_id === otherId && m.recipient_id === user.id && !m.read_at ? { ...m, read_at: now } : m)));
  };

  const sendMessage = async () => {
    if (!user || !selectedUserId) return;
    const content = newMessage.trim();
    if (!content) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();
    const temp: Message = {
      id: tempId,
      sender_id: user.id,
      recipient_id: selectedUserId,
      content,
      created_at: nowIso,
      read_at: null,
      _localStatus: 'sending',
      _tempId: tempId,
    };

    setMessages((prev) => [...prev, temp]);
    setNewMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: selectedUserId, content })
      .select("id, sender_id, recipient_id, content, created_at, read_at")
      .single();

    if (error || !data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _localStatus: 'error' } : m)));
      toast({ title: "Error", description: error?.message ?? "Failed to send message", variant: "destructive" });
      return;
    }

    setMessages((prev) => prev.map((m) => (m.id === tempId ? (data as Message) : m)));
  };

  const submitReport = async () => {
    if (!user || !selectedUserId) return;
    const reason = reportReason.trim();
    if (!reason) return;
    const { error } = await supabase
      .from("user_reports")
      .insert({ reporter_id: user.id, reported_user_id: selectedUserId, reason });
    if (error) {
      toast({ title: "Error", description: "Failed to submit report", variant: "destructive" });
      return;
    }
    toast({ title: "Reported", description: "Thanks. Our moderators will review this." });
    setReportReason("");
    setReportOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">Please sign in to use messages.</div>
    );
  }

  return (
    <div className="container mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[70vh] overflow-auto">
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.userId}
              onClick={() => fetchMessagesWith(c.userId)}
              className={`w-full text-left p-3 rounded-md border ${selectedUserId === c.userId ? 'bg-muted' : 'bg-background'} hover:bg-muted transition`}
            >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.profile?.full_name || c.profile?.email || `User ${c.userId.slice(0,8)}`}</div>
                    {c.lastMessage && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {c.lastMessage.content}
                      </div>
                    )}
                  </div>
                  {selectedUserId === c.userId && <Badge variant="secondary">Active</Badge>}
                </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {conversations.find((c) => c.userId === selectedUserId)?.profile?.full_name ||
               conversations.find((c) => c.userId === selectedUserId)?.profile?.email ||
               (selectedUserId ? `Chat with ${selectedUserId.slice(0,8)}` : 'Messages')}
            </CardTitle>
          {selectedUserId && (
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Report</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report user</DialogTitle>
                </DialogHeader>
                <Textarea
                  placeholder="Describe the issue (spam, scam, etc.)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <DialogFooter>
                  <Button onClick={submitReport}>Submit Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="flex flex-col h-[70vh]">
          <div className="flex-1 overflow-auto space-y-3 pr-2">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] p-3 rounded-lg border ${m.sender_id === user.id ? `ml-auto bg-primary/10 ${m._localStatus === 'error' ? 'border-destructive bg-destructive/10 text-destructive' : ''}` : 'mr-auto bg-muted'}`}>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
                {m.sender_id === user.id && (
                  <div className="mt-1 flex justify-end items-center gap-1 text-[10px]">
                    {m._localStatus === 'error' ? (
                      <span className="flex items-center gap-1 text-destructive"><AlertCircle className="h-3 w-3" /> Failed</span>
                    ) : m.read_at ? (
                      <CheckCheck className="h-3 w-3" aria-label="Read" />
                    ) : m._localStatus === 'sending' ? (
                      <Check className="h-3 w-3 opacity-60" aria-label="Sending" />
                    ) : (
                      <Check className="h-3 w-3" aria-label="Sent" />
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Type your message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              aria-label="Message"
              aria-label="Message"
            />
            <Button onClick={sendMessage} aria-label="Send message">Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
