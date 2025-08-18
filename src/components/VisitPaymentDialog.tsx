import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface VisitPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  visitDate: Date;
  onPaymentSuccess: () => void;
}

export const VisitPaymentDialog = ({ 
  open, 
  onOpenChange, 
  propertyId, 
  visitDate, 
  onPaymentSuccess 
}: VisitPaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handlePayment = async (paymentMethod: string) => {
    setIsProcessing(true);
    try {
      // Here you would integrate with your payment provider
      // For now, we'll simulate payment success
      
      // Create the paid visit request
      const { error } = await supabase
        .from('property_visits')
        .insert({
          property_id: propertyId,
          visitor_id: user?.id,
          visit_date: visitDate.toISOString(),
          is_paid_visit: true,
          payment_amount: 50000, // 50,000 UZS
          payment_status: 'paid'
        });

      if (error) throw error;

      toast({
        title: "Payment successful!",
        description: "Visit request created.",
      });
      onPaymentSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              You've already used your free visit request this week.
            </p>
            <p className="text-lg font-semibold mt-2">
              Additional visit cost: 50,000 UZS
            </p>
          </div>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors" 
                  onClick={() => handlePayment('click')}>
              <CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium">Click Payment</h4>
                  <p className="text-sm text-muted-foreground">Pay with bank card</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePayment('payme')}>
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium">Payme</h4>
                  <p className="text-sm text-muted-foreground">Pay with Payme wallet</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePayment('uzum')}>
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium">Uzum Bank</h4>
                  <p className="text-sm text-muted-foreground">Pay with Uzum Bank</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};