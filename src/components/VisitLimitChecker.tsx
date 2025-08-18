import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { VisitPaymentDialog } from "./VisitPaymentDialog";
import { useVisitLimits } from "@/hooks/useVisitLimits";
import { Clock, Ban, CreditCard } from "lucide-react";

interface VisitLimitCheckerProps {
  propertyId: string;
  onRequestSubmit: (visitDate: Date, isPaid?: boolean) => void;
  children: React.ReactNode;
}

export const VisitLimitChecker = ({ propertyId, onRequestSubmit, children }: VisitLimitCheckerProps) => {
  const { canCreate, reason, freeVisitsUsed, isRestricted, loading } = useVisitLimits();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [pendingVisitDate, setPendingVisitDate] = useState<Date | null>(null);

  const handleVisitRequest = (visitDate: Date) => {
    if (loading) return;
    
    if (isRestricted) {
      setShowRestrictedDialog(true);
      return;
    }

    if (!canCreate && reason.includes("Weekly visit limit reached")) {
      setShowRestrictedDialog(true);
      return;
    }

    if (freeVisitsUsed === 0) {
      // Free visit
      onRequestSubmit(visitDate, false);
    } else {
      // Paid visit required
      setPendingVisitDate(visitDate);
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingVisitDate) {
      onRequestSubmit(pendingVisitDate, true);
      setPendingVisitDate(null);
    }
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        onVisitRequest: handleVisitRequest,
        disabled: loading || (!canCreate && freeVisitsUsed >= 5),
      })}

      <VisitPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        propertyId={propertyId}
        visitDate={pendingVisitDate || new Date()}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <AlertDialog open={showRestrictedDialog} onOpenChange={setShowRestrictedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isRestricted ? (
                <>
                  <Ban className="h-5 w-5 text-destructive" />
                  Visit Requests Restricted
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-warning" />
                  Weekly Limit Reached
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowRestrictedDialog(false)}>
              Close
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};