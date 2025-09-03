import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, Check, X, MessageSquare, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AlternativeTimeOfferProps {
  request: {
    id: string;
    property_id: string;
    visit_date: string;
    is_custom_time: boolean | null;
    properties?: {
      title: string;
      location: string;
      user_id: string;
    } | null;
  };
  onRefresh: () => void;
}

export const AlternativeTimeOffer = ({ request, onRefresh }: AlternativeTimeOfferProps) => {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [counterDate, setCounterDate] = useState("");
  const [counterTime, setCounterTime] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleAccept = async () => {
    try {
      const { error } = await supabase
        .from('property_visits')
        .update({ status: 'confirmed' })
        .eq('id', request.id);
      
      if (error) throw error;
      
      toast({ 
        title: 'Alternative time accepted', 
        description: 'Your visit has been confirmed for the new time.' 
      });
      onRefresh();
    } catch (error) {
      console.error('Error accepting alternative time:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to accept alternative time', 
        variant: 'destructive' 
      });
    }
  };

  const handleCounterOffer = async () => {
    if (!counterDate || !counterTime) {
      toast({ 
        title: 'Error', 
        description: 'Please select both date and time', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const visit_date = new Date(`${counterDate}T${counterTime}`).toISOString();
      
      const { error } = await supabase
        .from('property_visits')
        .update({ 
          visit_date, 
          is_custom_time: true,
          status: 'pending'
        })
        .eq('id', request.id);
      
      if (error) throw error;
      
      toast({ 
        title: 'Counter-offer sent', 
        description: 'Your alternative time proposal has been sent to the property owner.' 
      });
      setShowCounterOffer(false);
      setCounterDate("");
      setCounterTime("");
      onRefresh();
    } catch (error) {
      console.error('Error sending counter-offer:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to send counter-offer', 
        variant: 'destructive' 
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a message', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          content: message.trim(),
          sender_id: user.id,
          recipient_id: request.properties?.user_id,
          property_id: request.property_id
        });
      
      if (error) throw error;
      
      toast({ title: 'Message sent' });
      setShowMessage(false);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to send message', 
        variant: 'destructive' 
      });
    }
  };

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('property_visits')
        .delete()
        .eq('id', request.id);
      
      if (error) throw error;
      
      toast({ 
        title: 'Visit request cancelled', 
        description: 'Your visit request has been cancelled.' 
      });
      onRefresh();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to cancel request', 
        variant: 'destructive' 
      });
    }
  };

  if (!request.is_custom_time) {
    return null;
  }

  return (
    <>
      <Card className="border-warning bg-warning/5 mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Badge variant="warning" className="px-2 py-1">
                 <Clock className="w-3 h-3 mr-1" />
                {t('visit.alternativeTimeOffered')}
              </Badge>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">
                The property owner has proposed a different time for your visit:
              </p>
              <div className="flex items-center text-foreground font-medium mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(request.visit_date).toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                <Clock className="w-4 h-4 ml-4 mr-2" />
                {new Date(request.visit_date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAccept}
                  className="flex items-center"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCounterOffer(true)}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Counter-offer
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowMessage(true)}
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel visit request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently cancel your visit request. You won't be able to recover it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep request</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel}>
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counter-offer Dialog */}
      <Dialog open={showCounterOffer} onOpenChange={(open) => !open && setShowCounterOffer(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Propose your preferred time</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date" 
                value={counterDate} 
                onChange={(e) => setCounterDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input 
                type="time" 
                value={counterTime} 
                onChange={(e) => setCounterTime(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCounterOffer(false)}>
              Cancel
            </Button>
            <Button onClick={handleCounterOffer}>
              Send Counter-offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessage} onOpenChange={(open) => !open && setShowMessage(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Message Property Owner</DialogTitle>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message about the visit time..."
            className="min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMessage(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};