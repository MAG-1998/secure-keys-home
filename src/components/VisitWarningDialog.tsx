import React from "react";
import { AlertTriangle, Ban } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface VisitWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  type: "request" | "cancel";
}

export const VisitWarningDialog = ({ open, onOpenChange, onConfirm, type }: VisitWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {type === "request" ? "Важное предупреждение" : "Предупреждение об отмене"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {type === "request" ? (
              <>
                <p className="font-medium">
                  Обратите внимание на правила посещения недвижимости:
                </p>
                <div className="space-y-2 text-sm">
                  <p>• <strong>Первая отмена или неявка:</strong> Предупреждение</p>
                  <p>• <strong>Вторая отмена или неявка:</strong> Запрет на 1 неделю</p>
                  <p>• <strong>Третья отмена или неявка:</strong> Запрет на 1 месяц</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <p className="text-sm flex items-center gap-2">
                    <Ban className="h-4 w-4 text-destructive" />
                    <strong className="text-destructive">
                      Повторные нарушения могут привести к пожизненной блокировке аккаунта
                    </strong>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Запреты действуют как на заявки на посещение, так и на заявки на халяльное финансирование.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-destructive">
                  Вы уверены, что хотите отменить подтвержденное посещение?
                </p>
                <p className="text-sm">
                  Отмена подтвержденного посещения может привести к наложению штрафных санкций:
                </p>
                <div className="space-y-2 text-sm">
                  <p>• Временная блокировка создания новых заявок</p>
                  <p>• Ограничение доступа к халяльному финансированию</p>
                  <p>• При повторных нарушениях - блокировка аккаунта</p>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {type === "request" ? "Отмена" : "Не отменять"}
          </Button>
          <Button 
            variant={type === "request" ? "default" : "destructive"} 
            onClick={onConfirm}
          >
            {type === "request" ? "Понимаю, продолжить" : "Подтвердить отмену"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};