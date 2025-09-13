import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { VisitPaymentDialog } from "./VisitPaymentDialog";
import { VisitWarningDialog } from "./VisitWarningDialog";
import { useVisitLimits } from "@/hooks/useVisitLimits";
import { Clock, Ban, CreditCard, Crown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface VisitLimitCheckerProps {
  propertyId: string;
  onRequestSubmit: (visitDate: Date, isPaid?: boolean) => void;
  children: React.ReactNode;
}

export const VisitLimitChecker = ({ propertyId, onRequestSubmit, children }: VisitLimitCheckerProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { canCreate, reason, freeVisitsUsed, isRestricted, loading, recheckLimits } = useVisitLimits(propertyId);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [pendingVisitDate, setPendingVisitDate] = useState<Date | null>(null);

  const handleVisitRequest = (visitDate: Date) => {
    if (loading) return;
    
    // Check if user is authenticated
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (isRestricted) {
      setShowRestrictedDialog(true);
      return;
    }

    if (!canCreate) {
      // Check if it's weekly limit reached to show upgrade dialog
      if (reason.includes("Weekly visit limit reached")) {
        setShowUpgradeDialog(true);
        return;
      }
      // Show error for any other reason
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
        disabled: loading,
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
                  Unable to Create Visit Request
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

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              Weekly Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription>
              You've reached your free weekly visit limit (5 visits). Choose an option below to continue:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                setShowUpgradeDialog(false);
                setPendingVisitDate(new Date());
                setShowPaymentDialog(true);
              }}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay for This Visit (One-time)
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeDialog(false)}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium (Coming Soon)
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowUpgradeDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};