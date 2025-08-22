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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, MapPin, MessageSquare, X, Star, UserCheck, UserX, Ban, CreditCard } from "lucide-react";
import { MagitLogo } from "@/components/MagitLogo";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { VisitRestrictionDialog } from "@/components/VisitRestrictionDialog";

interface OwnerRequestRow {
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
    user_id: string;
  } | null;
}

interface VisitRequestCardProps {
  request: OwnerRequestRow;
  showActions: string[];
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  onMessage?: (id: string) => void;
  onAlternative?: (id: string) => void;
  onReview?: (id: string) => void;
  onRestrictUser?: (userId: string, reason: string, isPermanent: boolean, restrictedUntil?: Date) => void;
  isFinished?: boolean;
  currentUserRole?: string;
}

const VisitRequestCard = ({ 
  request: r, 
  showActions, 
  onApprove, 
  onDeny, 
  onMessage, 
  onAlternative, 
  onReview,
  onRestrictUser,
  isFinished = false,
  currentUserRole
}: VisitRequestCardProps) => {
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={r.properties?.image_url || '/placeholder.svg'}
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
              <span className="text-sm">{r.properties?.location}</span>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <div className="flex items-center text-foreground font-semibold">
                <Calendar className="w-5 h-5 mr-2" />
                {new Date(r.visit_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex items-center text-primary font-bold mt-1">
                <Clock className="w-5 h-5 mr-2" />
                {new Date(r.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {r.is_custom_time ? <Badge variant="warning" className="ml-2">custom</Badge> : null}
              </div>
            </div>

            {/* Review status for finished visits */}
            {isFinished && (
              <div className="mt-3">
                {r.review_submitted_at ? (
                  <div className="text-sm text-muted-foreground">
                    <Star className="w-4 h-4 inline mr-1" />
                    Review completed {new Date(r.review_submitted_at).toLocaleDateString()}
                    {r.visitor_showed_up !== null && (
                      <div className="mt-1">
                        Visitor {r.visitor_showed_up ? 'showed up' : 'did not show up'}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Awaiting review
                  </Badge>
                )}
              </div>
            )}

            {/* Payment info for paid visits */}
            {r.is_paid_visit && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Paid visit ({r.payment_amount?.toLocaleString()} UZS)
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          {showActions.includes("message") && onMessage && (
            <Button variant="ghost" size="sm" onClick={() => onMessage(r.id)}>
              <MessageSquare className="w-4 h-4 mr-1" /> Message
            </Button>
          )}

          {showActions.includes("alternative") && onAlternative && (
            <Button variant="outline" size="sm" onClick={() => onAlternative(r.id)}>
              <Clock className="w-4 h-4 mr-1" /> Offer alternative
            </Button>
          )}

          {showActions.includes("approve") && onApprove && (!r.status || r.status === 'pending') && (
            <Button variant="secondary" size="sm" onClick={() => onApprove(r.id)}>
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
          )}

          {showActions.includes("deny") && onDeny && (!r.status || r.status === 'pending') && (
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
                  <AlertDialogAction asChild>
                    <Button onClick={() => onDeny(r.id)}>Yes, deny</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {showActions.includes("review") && onReview && !r.review_submitted_at && (
            <Button variant="outline" size="sm" onClick={() => onReview(r.id)}>
              <Star className="w-4 h-4 mr-1" /> Leave Review
            </Button>
          )}

          {/* Restrict user option for moderators/admins when visitor didn't show */}
          {r.visitor_showed_up === false && onRestrictUser && (currentUserRole === 'admin' || currentUserRole === 'moderator') && (
            <VisitRestrictionDialog
              userId={r.visitor_id}
              userName="User"
              onRestrictUser={onRestrictUser}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const VisitRequests = () => {
  const [requests, setRequests] = useState<OwnerRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [altForId, setAltForId] = useState<string | null>(null);
  const [altDate, setAltDate] = useState("");
  const [altTime, setAltTime] = useState("");
  const [msgForId, setMsgForId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [reviewForId, setReviewForId] = useState<string | null>(null);
  const [showedUp, setShowedUp] = useState<boolean | null>(null);
  const [ownerReview, setOwnerReview] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

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
        .neq('visitor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data as OwnerRequestRow[]) || [];
      const sorted = rows.sort((a, b) => {
        const group = (r: OwnerRequestRow) => (!r.status || r.status === 'pending') ? 0 : (r.status === 'confirmed' ? 1 : 2);
        const ga = group(a);
        const gb = group(b);
        if (ga !== gb) return ga - gb;
        if (ga === 1) {
          // Confirmed: sort by visit date ascending
          return new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
        }
        if (ga === 0) {
          // Pending: sort by visit date ascending for relevance
          return new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
        }
        // Denied: newest first by created_at
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setRequests(sorted);
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

  const openReview = (id: string) => {
    setReviewForId(id);
    setShowedUp(null);
    setOwnerReview('');
  };

  const submitReview = async () => {
    if (!reviewForId || showedUp === null) return;
    try {
      const { error } = await supabase
        .from('property_visits')
        .update({
          visitor_showed_up: showedUp,
          owner_review: ownerReview.trim() || null,
          review_submitted_at: new Date().toISOString()
        })
        .eq('id', reviewForId);
      if (error) throw error;
      toast({ title: 'Review saved', description: 'Thank you for your feedback.' });
      setReviewForId(null);
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not save review', variant: 'destructive' });
    }
  };

  const handleRestrictUser = async (userId: string, reason: string, isPermanent: boolean, restrictedUntil?: Date) => {
    try {
      const { error } = await supabase
        .from('visit_restrictions')
        .insert({
          user_id: userId,
          restricted_by: user?.id,
          reason,
          is_permanent: isPermanent,
          restricted_until: restrictedUntil?.toISOString()
        });

      if (error) throw error;
      toast({ title: 'User restricted', description: 'User has been restricted from creating visit requests.' });
      await refresh();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not restrict user', variant: 'destructive' });
    }
  };

  // Categorize requests
  const now = new Date();
  const comingRequests = requests.filter(r => 
    r.status === 'confirmed' && new Date(r.visit_date) >= now
  );
  const deniedRequests = requests.filter(r => r.status === 'denied');
  const finishedRequests = requests.filter(r => 
    r.status === 'confirmed' && new Date(r.visit_date) < now
  );
  const pendingRequests = requests.filter(r => 
    !r.status || r.status === 'pending'
  );

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
          <Tabs defaultValue="coming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="coming" className="text-center">
                Coming ({[...pendingRequests, ...comingRequests].length})
              </TabsTrigger>
              <TabsTrigger value="denied" className="text-center">
                Denied ({deniedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="finished" className="text-center">
                Finished ({finishedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coming" className="space-y-6">
              {[...pendingRequests, ...comingRequests].length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-4">No Upcoming Visits</h3>
                  <p className="text-muted-foreground">All confirmed visits are showing here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...pendingRequests, ...comingRequests].map((r) => (
                    <VisitRequestCard
                      key={r.id}
                      request={r}
                      showActions={["message", "alternative", "approve", "deny"]}
                      onApprove={onApprove}
                      onDeny={onDeny}
                      onMessage={openMsg}
                      onAlternative={openAlt}
                      onRestrictUser={handleRestrictUser}
                      currentUserRole={user?.role}
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
                    <VisitRequestCard
                      key={r.id}
                      request={r}
                      showActions={["message"]}
                      onMessage={openMsg}
                      onRestrictUser={handleRestrictUser}
                      currentUserRole={user?.role}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="finished" className="space-y-6">
              {finishedRequests.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-heading font-bold text-xl text-foreground mb-4">No Finished Visits</h3>
                  <p className="text-muted-foreground">Completed visits will appear here for review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {finishedRequests.map((r) => (
                    <VisitRequestCard
                      key={r.id}
                      request={r}
                      showActions={["message", "review"]}
                      onMessage={openMsg}
                      onReview={openReview}
                      onRestrictUser={handleRestrictUser}
                      isFinished={true}
                      currentUserRole={user?.role}
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

        {/* Alternative Time Dialog */}
        <Dialog open={altForId !== null} onOpenChange={(open) => !open && setAltForId(null)}>
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

        {/* Review Dialog */}
        <Dialog open={reviewForId !== null} onOpenChange={(open) => !open && setReviewForId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Visit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Did the visitor show up?</label>
                <div className="flex gap-2">
                  <Button
                    variant={showedUp === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowedUp(true)}
                  >
                    <UserCheck className="w-4 h-4 mr-1" /> Yes, they came
                  </Button>
                  <Button
                    variant={showedUp === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowedUp(false)}
                  >
                    <UserX className="w-4 h-4 mr-1" /> No, they didn't show
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Additional notes (optional)</label>
                <Textarea
                  value={ownerReview}
                  onChange={(e) => setOwnerReview(e.target.value)}
                  placeholder="Share your experience or notes about this visit..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewForId(null)}>Cancel</Button>
              <Button onClick={submitReview} disabled={showedUp === null}>
                Save Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default VisitRequests;
