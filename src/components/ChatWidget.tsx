import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, X, Send, ChevronLeft, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Simple message type matching DB
interface DBMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  property_id?: string | null;
}

// Derived conversation summary
interface ConversationItem {
  otherUserId: string;
  lastMessage?: DBMessage;
}

function getOtherUserId(m: DBMessage, myId: string) {
  return m.sender_id === myId ? m.recipient_id : m.sender_id;
}

export default function ChatWidget() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const { notifications } = useNotifications(10);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allMyMessages, setAllMyMessages] = useState<DBMessage[]>([]);
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<DBMessage[]>([]);
  const [text, setText] = useState("");

  const myId = user?.id ?? null;
  const lastNotifId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const conversations: ConversationItem[] = useMemo(() => {
    if (!myId) return [];
    const map = new Map<string, DBMessage>();
    for (const m of [...allMyMessages].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))) {
      const other = getOtherUserId(m, myId);
      if (!map.has(other)) map.set(other, m);
    }
    return Array.from(map.entries()).map(([otherUserId, lastMessage]) => ({ otherUserId, lastMessage }));
  }, [allMyMessages, myId]);

  const loadMyMessages = useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id,sender_id,recipient_id,content,created_at,property_id")
      .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Could not load messages", description: error.message, variant: "destructive" });
    }
    setAllMyMessages(data || []);
    setLoading(false);
  }, [myId, toast]);

  const loadThread = useCallback(async (otherId: string) => {
    if (!myId || !otherId) return;
    const { data, error } = await supabase
      .from("messages")
      .select("id,sender_id,recipient_id,content,created_at,property_id")
      .or(`and(sender_id.eq.${myId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${myId})`)
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Could not load chat", description: error.message, variant: "destructive" });
    }
    setCurrentMessages(data || []);
    // scroll to bottom after load
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "auto" }), 0);
  }, [myId, toast]);

  useEffect(() => {
    loadMyMessages();
  }, [loadMyMessages]);

  useEffect(() => {
    if (!myId) return;
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${myId}` },
        (payload) => {
          const m = payload.new as DBMessage;
          setAllMyMessages((prev) => [m, ...prev]);
          if (selectedOtherId && getOtherUserId(m, myId) === selectedOtherId) {
            setCurrentMessages((prev) => [...prev, m]);
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 0);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${myId}` },
        (payload) => {
          const m = payload.new as DBMessage;
          setAllMyMessages((prev) => [m, ...prev]);
          if (selectedOtherId && getOtherUserId(m, myId) === selectedOtherId) {
            setCurrentMessages((prev) => [...prev, m]);
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, selectedOtherId]);

  // Auto-open when a new message notification arrives
  useEffect(() => {
    if (!notifications?.length) return;
    const newest = notifications[0];
    if (newest?.id && lastNotifId.current !== newest.id && newest.type === "message:new") {
      lastNotifId.current = newest.id;
      setOpen(true);
      const senderId = (newest.data?.sender_id as string) || null;
      if (senderId) {
        setSelectedOtherId(senderId);
        loadThread(senderId);
      }
    }
  }, [notifications, loadThread]);

  useEffect(() => {
    if (selectedOtherId) loadThread(selectedOtherId);
  }, [selectedOtherId, loadThread]);

  const send = useCallback(async () => {
    if (!myId || !selectedOtherId || !text.trim()) return;
    const msg = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      sender_id: myId,
      recipient_id: selectedOtherId,
      content: msg,
    } as any);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    }
  }, [myId, selectedOtherId, text, toast]);

  if (!myId) return null; // only for authenticated users

  return (
    <div className="fixed z-50 right-4 bottom-4">
      {/* Floating button */}
      {!open && (
        <Button aria-label="Open chat" className="shadow-lg" onClick={() => setOpen(true)}>
          <MessageSquare className="mr-2 h-4 w-4" /> Chat
        </Button>
      )}

      {open && (
        <Card className="w-[92vw] max-w-[380px] h-[70vh] max-h-[540px] bg-card text-card-foreground border shadow-2xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              {selectedOtherId ? (
                <Button variant="ghost" size="sm" onClick={() => setSelectedOtherId(null)} aria-label="Back" className="px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : null}
              <div className="font-medium">
                {selectedOtherId ? "Chat" : "Messages"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm" title="Open full messages" className="px-2">
                <Link to="/messages">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          {!selectedOtherId ? (
            <div className="h-[calc(100%-2.5rem)] flex flex-col">
              <div className="px-3 py-2 border-b text-sm text-muted-foreground flex items-center justify-between">
                <span>{loading ? "Loading…" : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}</span>
                <Button variant="outline" size="sm" onClick={loadMyMessages}>
                  Refresh
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.map((c) => (
                    <button
                      key={c.otherUserId}
                      className="w-full text-left rounded-md border hover:bg-muted/50 transition px-3 py-2"
                      onClick={() => setSelectedOtherId(c.otherUserId)}
                    >
                      <div className="text-sm font-medium truncate">User {c.otherUserId.slice(0, 8)}</div>
                      {c.lastMessage && (
                        <div className="text-xs text-muted-foreground truncate">
                          {c.lastMessage.sender_id === myId ? "You: " : ""}
                          {c.lastMessage.content}
                        </div>
                      )}
                    </button>
                  ))}

                  {conversations.length === 0 && (
                    <div className="text-sm text-muted-foreground px-2 py-6 text-center">
                      No messages yet.
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-2 border-t">
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/messages">
                    <Headset className="mr-2 h-4 w-4" /> Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100%-2.5rem)] flex flex-col">
              <div ref={listRef} className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {currentMessages.map((m) => {
                    const mine = m.sender_id === myId;
                    return (
                      <div
                        key={m.id}
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          mine
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "mr-auto bg-muted"
                        }`}
                      >
                        {m.content}
                        <div className={`mt-1 text-[10px] opacity-70 ${mine ? "text-primary-foreground" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-2 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                    aria-label="Message"
                  />
                  <Button type="submit" disabled={!text.trim()} aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
