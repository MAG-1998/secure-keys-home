import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { VisitPaymentDialog } from "./VisitPaymentDialog";
import { VisitWarningDialog } from "./VisitWarningDialog";
import { useVisitLimits } from "@/hooks/useVisitLimits";
import { Clock, Ban, CreditCard } from "lucide-react";

interface VisitLimitCheckerProps {
  propertyId: string;
  onRequestSubmit: (visitDate: Date, isPaid?: boolean) => void;
  children: React.ReactNode;
}

export const VisitLimitChecker = ({ propertyId, onRequestSubmit, children }: VisitLimitCheckerProps) => {
  const { canCreate, reason, freeVisitsUsed, isRestricted, loading, recheckLimits } = useVisitLimits(propertyId);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingVisitDate, setPendingVisitDate] = useState<Date | null>(null);

  const handleVisitRequest = (visitDate: Date) => {
    if (loading) return;
    
    if (isRestricted) {
      setShowRestrictedDialog(true);
      return;
    }

    if (!canCreate) {
      // Show error for any reason why the user can't create a visit
      setShowRestrictedDialog(true);
      return;
    }

    // Show warning dialog first before proceeding
    setPendingVisitDate(visitDate);
    setShowWarningDialog(true);
  };

  const handleWarningConfirm = () => {
    setShowWarningDialog(false);
    
    if (freeVisitsUsed === 0) {
      // Free visit
      onRequestSubmit(pendingVisitDate!, false);
      setPendingVisitDate(null);
      // Recheck limits after request submission
      setTimeout(() => recheckLimits(), 1000);
    } else {
      // Paid visit required
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingVisitDate) {
      onRequestSubmit(pendingVisitDate, true);
      setPendingVisitDate(null);
      // Recheck limits after request submission
      setTimeout(() => recheckLimits(), 1000);
    }
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          const visitDate = new Date(); // This will be handled by the validation
          handleVisitRequest(visitDate);
        },
        disabled: loading || !canCreate,
      })}

      <VisitWarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleWarningConfirm}
        type="request"
      />

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
              ) : reason.includes("already have an active visit request") ? (
                <>
                  <Ban className="h-5 w-5 text-warning" />
                  Duplicate Request Not Allowed
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-warning" />
                  Visit Limit Reached
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