import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, MapPin, MessageSquare, X, Star } from "lucide-react";
import { MagitLogo } from "@/components/MagitLogo";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface VisitorRequestRow {
  id: string;
  property_id: string;
  visitor_id: string;
  status: string | null;
  visit_date: string;
  is_custom_time: boolean | null;
  notes: string | null;
  created_at: string;
  visitor_showed_up: boolean | null;
  owner_review: string | null;
  review_submitted_at: string | null;
  is_paid_visit: boolean | null;
  payment_amount: number | null;
  properties?: {
    id: string;
    title: string;
    location: string;
    image_url: string | null;
    photos?: string[];
    user_id: string;
  } | null;
}

interface MyRequestCardProps {
  request: VisitorRequestRow;
  onCancel?: (id: string) => void;
  onMessage?: (id: string) => void;
  isFinished?: boolean;
}

const MyRequestCard = ({ 
  request: r, 
  onCancel,
  onMessage,
  isFinished = false
}: MyRequestCardProps) => {
  const imageUrl = r.properties?.image_url || (r.properties?.photos && r.properties.photos.length > 0 ? r.properties.photos[0] : '/placeholder.svg');
  
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={imageUrl}
          alt={r.properties?.title || 'Property'}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex gap-4 items-start">
          {/* Left: Status indicator */}
          <div className="shrink-0">
            <Badge
              variant={r.status === 'confirmed' ? 'success' : r.status === 'denied' ? 'destructive' : 'warning'}
              className="px-3 py-1.5 text-sm md:text-base rounded-md capitalize"
            >
              {r.status === 'confirmed' ? (
                <span className="inline-flex items-center">
                  <Check className="w-4 h-4 mr-1" /> 
                  {isFinished ? 'finished' : 'confirmed'}
                </span>
              ) : r.status === 'denied' ? (
                <span className="inline-flex items-center"><X className="w-4 h-4 mr-1" /> denied</span>
              ) : (
                <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" /> pending</span>
              )}
            </Badge>
          </div>

          {/* Right: Property details and visit time */}
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">{r.properties?.title || 'Property'}</h3>
            <div className="flex items-center text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{r.properties?.location || 'Location not available'}</span>
            </div>

            <div className="flex items-center text-muted-foreground mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {new Date(r.visit_date).toLocaleDateString()} at {new Date(r.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {r.is_custom_time && <span className="ml-2 text-xs text-warning">(Alternative time)</span>}
              </span>
            </div>

            {r.notes && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Note: {r.notes}</p>
              </div>
            )}

            {r.is_paid_visit && r.payment_amount && (
              <div className="mb-4">
                <Badge variant="secondary">Paid Visit - ${r.payment_amount.toLocaleString()}</Badge>
              </div>
            )}

            {isFinished && r.owner_review && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">Owner's Review</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.owner_review}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {onMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage(r.id)}
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              )}
              
              {!isFinished && r.status === 'pending' && onCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(r.id)}
                  className="flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyRequests = () => {
  const [requests, setRequests] = useState<VisitorRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgForId, setMsgForId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    document.title = "My Visit Requests • Magit";
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
            id, title, location, image_url, photos, user_id
          )
        `)
        .eq('visitor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data as VisitorRequestRow[]) || [];
      setRequests(rows);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onCancel = async (id: string) => {
    try {
      const { error } = await supabase.from('property_visits').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Cancelled', description: 'Visit request cancelled.' });
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not cancel request', variant: 'destructive' });
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
          recipient_id: req.properties?.user_id,
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

  const pendingRequests = requests.filter(r => !r.status || r.status === 'pending');
  const confirmedRequests = requests.filter(r => r.status === 'confirmed' && new Date(r.visit_date) > new Date());
  const deniedRequests = requests.filter(r => r.status === 'denied');
  const finishedRequests = requests.filter(r => r.status === 'confirmed' && new Date(r.visit_date) <= new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your requests...</p>
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
              <h1 className="font-heading font-bold text-xl text-foreground">My Visit Requests</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/properties')}>Browse Properties</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">No Requests Yet</h2>
            <p className="text-muted-foreground mb-8">You haven't made any visit requests yet.</p>
            <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="active" className="text-center">
                Active ({[...pendingRequests, ...confirmedRequests].length})
              </TabsTrigger>
              <TabsTrigger value="denied" className="text-center">
                Denied ({deniedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="finished" className="text-center">
                Finished ({finishedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {[...pendingRequests, ...confirmedRequests].length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-4">No Active Requests</h3>
                  <p className="text-muted-foreground">Your pending and confirmed visit requests will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...pendingRequests, ...confirmedRequests].map((r) => (
                    <MyRequestCard
                      key={r.id}
                      request={r}
                      onCancel={r.status === 'pending' ? onCancel : undefined}
                      onMessage={openMsg}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="denied" className="space-y-6">
              {deniedRequests.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-4">No Denied Requests</h3>
                  <p className="text-muted-foreground">Denied visit requests will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {deniedRequests.map((r) => (
                    <MyRequestCard
                      key={r.id}
                      request={r}
                      onMessage={openMsg}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="finished" className="space-y-6">
              {finishedRequests.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-4">No Finished Visits</h3>
                  <p className="text-muted-foreground">Your completed visits will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {finishedRequests.map((r) => (
                    <MyRequestCard
                      key={r.id}
                      request={r}
                      onMessage={openMsg}
                      isFinished={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Message Dialog */}
        <Dialog open={msgForId !== null} onOpenChange={(open) => !open && setMsgForId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message Property Owner</DialogTitle>
            </DialogHeader>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the property owner..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMsgForId(null)}>Cancel</Button>
              <Button onClick={submitMsg}>Send</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MyRequests;