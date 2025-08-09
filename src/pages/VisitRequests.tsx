import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Clock, MapPin, MessageSquare, X } from "lucide-react";
import { MagitLogo } from "@/components/MagitLogo";
import { useToast } from "@/hooks/use-toast";

interface OwnerRequestRow {
  id: string;
  property_id: string;
  visitor_id: string;
  status: string | null;
  visit_date: string;
  is_custom_time: boolean | null;
  notes: string | null;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    location: string;
    image_url: string | null;
    user_id: string;
  } | null;
}

const VisitRequests = () => {
  const [requests, setRequests] = useState<OwnerRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [altForId, setAltForId] = useState<string | null>(null);
  const [altDate, setAltDate] = useState("");
  const [altTime, setAltTime] = useState("");
  const [msgForId, setMsgForId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Visit Requests Inbox • Magit";
  }, []);

  const refresh = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      const { data, error } = await supabase
        .from('property_visits')
        .select(`
          *,
          properties:property_id (
            id, title, location, image_url, user_id
          )
        `)
        .eq('properties.user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests((data as OwnerRequestRow[]) || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onApprove = async (id: string) => {
    try {
      const { error } = await supabase.from('property_visits').update({ status: 'confirmed' }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Approved', description: 'Visit confirmed.' });
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not approve request', variant: 'destructive' });
    }
  };

  const onDeny = async (id: string) => {
    try {
      const { error } = await supabase.from('property_visits').update({ status: 'denied' }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Denied', description: 'Request denied.' });
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not deny request', variant: 'destructive' });
    }
  };

  const openAlt = (id: string) => {
    setAltForId(id);
    setAltDate('');
    setAltTime('');
  };

  const submitAlt = async () => {
    if (!altForId || !altDate || !altTime) return;
    try {
      const visit_date = new Date(`${altDate}T${altTime}`).toISOString();
      const { error } = await supabase
        .from('property_visits')
        .update({ visit_date, is_custom_time: true })
        .eq('id', altForId);
      if (error) throw error;
      toast({ title: 'Proposed new time', description: 'The visitor will see the updated time.' });
      setAltForId(null);
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not propose time', variant: 'destructive' });
    }
  };

  const openMsg = (id: string) => {
    setMsgForId(id);
    setMessage('');
  };

  const submitMsg = async () => {
    const req = requests.find(r => r.id === msgForId);
    if (!req || !message.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('messages')
        .insert({
          content: message.trim(),
          sender_id: user.id,
          recipient_id: req.visitor_id,
          property_id: req.property_id
        });
      if (error) throw error;
      toast({ title: 'Message sent' });
      setMsgForId(null);
      setMessage('');
    } catch (e) {
      toast({ title: 'Error', description: 'Could not send message', variant: 'destructive' });
    }
  };

  const title = useMemo(() => 'Visit Requests Inbox', []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading visit requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">{title}</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/my-properties')}>My Listings</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">No Requests Yet</h2>
            <p className="text-muted-foreground mb-8">You will see visit requests for your properties here.</p>
            <Button onClick={() => navigate('/properties')}>Browse Buyers</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((r) => (
              <Card key={r.id} className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={r.properties?.image_url || '/placeholder.svg'}
                    alt={r.properties?.title || 'Property'}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-1">{r.properties?.title || 'Property'}</h3>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{r.properties?.location}</span>
                      </div>
                    </div>
                    <Badge variant={r.status === 'confirmed' ? 'success' : r.status === 'denied' ? 'destructive' : 'secondary'}>
                      {r.status || 'pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(r.visit_date).toLocaleString()}
                    {r.is_custom_time ? <span className="ml-2">(custom)</span> : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <Dialog open={msgForId === r.id} onOpenChange={(open) => !open && setMsgForId(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => openMsg(r.id)}>
                          <MessageSquare className="w-4 h-4 mr-1" /> Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Message Visitor</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message to the visitor..."
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setMsgForId(null)}>Cancel</Button>
                          <Button onClick={submitMsg}>Send</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={altForId === r.id} onOpenChange={(open) => !open && setAltForId(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openAlt(r.id)}>
                          <Clock className="w-4 h-4 mr-1" /> Offer alternative
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Propose an alternative time</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={altDate} onChange={(e) => setAltDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time</label>
                            <Input type="time" value={altTime} onChange={(e) => setAltTime(e.target.value)} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setAltForId(null)}>Cancel</Button>
                          <Button onClick={submitAlt}>Send Proposal</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {(!r.status || r.status === 'pending') && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => onApprove(r.id)}>
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <X className="w-4 h-4 mr-1" /> Deny
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will mark the request as denied. The visitor will no longer see it as active.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeny(r.id)}>Yes, deny</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VisitRequests;
