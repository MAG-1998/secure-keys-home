import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Ban } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VisitRestrictionDialogProps {
  userId: string;
  userName: string;
  onRestrictUser: (userId: string, reason: string, isPermanent: boolean, restrictedUntil?: Date) => void;
}

export const VisitRestrictionDialog = ({ userId, userName, onRestrictUser }: VisitRestrictionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [restrictedUntil, setRestrictedUntil] = useState<Date>();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    
    onRestrictUser(userId, reason, isPermanent, restrictedUntil);
    setOpen(false);
    setReason("");
    setIsPermanent(false);
    setRestrictedUntil(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban className="h-4 w-4 mr-2" />
          Restrict User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restrict User: {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for restriction</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this user is being restricted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="permanent"
              checked={isPermanent}
              onCheckedChange={setIsPermanent}
            />
            <Label htmlFor="permanent">Permanent restriction</Label>
          </div>

          {!isPermanent && (
            <div>
              <Label>Restricted until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !restrictedUntil && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {restrictedUntil ? format(restrictedUntil, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={restrictedUntil}
                    onSelect={setRestrictedUntil}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason.trim() || (!isPermanent && !restrictedUntil)}
            >
              Restrict User
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};