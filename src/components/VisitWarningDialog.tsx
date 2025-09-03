import React from "react";
import { AlertTriangle, Ban } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface VisitWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  type: "request" | "cancel";
}

export const VisitWarningDialog = ({ open, onOpenChange, onConfirm, type }: VisitWarningDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {type === "request" ? t('visitWarning.importantWarning') : t('visitWarning.cancellationWarning')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {type === "request" ? (
              <>
                <p className="font-medium">
                  {t('visitWarning.attentionToRules')}
                </p>
                <div className="space-y-2 text-sm">
                  <p>• <strong>{t('visitWarning.firstCancellation')}</strong></p>
                  <p>• <strong>{t('visitWarning.secondCancellation')}</strong></p>
                  <p>• <strong>{t('visitWarning.thirdCancellation')}</strong></p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <p className="text-sm flex items-center gap-2">
                    <Ban className="h-4 w-4 text-destructive" />
                    <strong className="text-destructive">
                      {t('visitWarning.repeatedViolations')}
                    </strong>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('visitWarning.bansApplyToBoth')}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-destructive">
                  {t('visitWarning.sureToCancel')}
                </p>
                <p className="text-sm">
                  {t('visitWarning.cancelConfirmedVisit')}
                </p>
                <div className="space-y-2 text-sm">
                  <p>• {t('visitWarning.temporaryBlock')}</p>
                  <p>• {t('visitWarning.restrictedFinancing')}</p>
                  <p>• {t('visitWarning.repeatedViolationsBlock')}</p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {type === "request" ? t('common.cancel') : t('visitWarning.notCancel')}
          </Button>
          <Button 
            variant={type === "request" ? "default" : "destructive"} 
            onClick={onConfirm}
          >
            {type === "request" ? t('visitWarning.understandContinue') : t('visitWarning.confirmCancellation')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};