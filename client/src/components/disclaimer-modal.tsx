import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles } from "lucide-react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent 
        className="gradient-border animate-scale-in [&>button]:hidden !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 w-[85vw] max-w-xs p-4"
      >
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-2 w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center neon-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="font-display text-lg text-center gradient-text" data-testid="text-disclaimer-title">
            Welcome to Seek
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-xs">
            Creative effects playground
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground">
            For fun pranks only. All processing is local and private. Use responsibly.
          </p>
        </div>

        <DialogFooter>
          <Button 
            onClick={onAccept} 
            className="w-full bg-neon-gradient text-white font-semibold"
            data-testid="button-accept-disclaimer"
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
