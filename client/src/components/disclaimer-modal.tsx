import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, Shield } from "lucide-react";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md gradient-border animate-scale-in [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-neon-gradient flex items-center justify-center neon-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="font-display text-2xl text-center gradient-text" data-testid="text-disclaimer-title">
            Welcome to Seek
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-2">
            Your creative effects playground
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-200">Important Notice</p>
              <p className="text-xs text-muted-foreground">
                This app is for fun pranks and creative content only. Always get consent before sharing content featuring others.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg bg-card border border-border">
            <Shield className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Your Privacy</p>
              <p className="text-xs text-muted-foreground">
                All processing happens locally in your browser. Your photos and audio never leave your device.
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground pl-4">
            <li className="flex items-start gap-2">
              <span className="text-neon-purple mt-1">•</span>
              <span>Outputs are altered content - use responsibly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-blue mt-1">•</span>
              <span>Do not use for deception or harmful purposes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan mt-1">•</span>
              <span>Respect others' likeness and voice rights</span>
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button 
            onClick={onAccept} 
            className="w-full bg-neon-gradient text-white font-semibold"
            data-testid="button-accept-disclaimer"
          >
            I Understand - Let's Create!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
