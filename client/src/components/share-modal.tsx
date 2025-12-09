import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Copy,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { SiX, SiFacebook, SiWhatsapp, SiLinkedin } from "react-icons/si";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPhoto: boolean;
  hasAudio: boolean;
  onExportForShare: () => Promise<void>;
  isExporting: boolean;
}

export function ShareModal({
  open,
  onOpenChange,
  hasPhoto,
  hasAudio,
  onExportForShare,
  isExporting,
}: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareMessage = "Check out this awesome creation I made with Seek - the Creative Effects Studio!";
  const shareUrl = window.location.href;
  const fullShareText = `${shareMessage}\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Share message copied! Paste it anywhere to share.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Seek - Creative Effects Studio",
          text: shareMessage,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
          description: "Your creation has been shared!",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            title: "Share failed",
            description: "Could not share. Please try another method.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  const canExport = hasPhoto || hasAudio;
  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-share-title">
            <Share2 className="w-5 h-5" />
            Share Your Creation
          </DialogTitle>
          <DialogDescription data-testid="text-share-description">
            Download your creation or share it on social media.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium" data-testid="text-download-section">Download</h4>
            <Button
              onClick={onExportForShare}
              disabled={!canExport || isExporting}
              className="w-full gap-2"
              data-testid="button-download-share"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download for Sharing
                </>
              )}
            </Button>
            {!canExport && (
              <p className="text-xs text-muted-foreground">
                Upload a photo or record audio first to download.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium" data-testid="text-copy-section">Copy Share Message</h4>
            <div className="flex gap-2">
              <Input
                readOnly
                value={fullShareText}
                className="text-sm"
                data-testid="input-share-message"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {hasNativeShare && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium" data-testid="text-native-share-section">Quick Share</h4>
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="w-full gap-2"
                data-testid="button-native-share"
              >
                <Share2 className="w-4 h-4" />
                Share via Device
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium" data-testid="text-social-section">Share on Social</h4>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleSocialShare("twitter")}
                className="hover-elevate"
                data-testid="button-share-twitter"
              >
                <SiX className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleSocialShare("facebook")}
                className="hover-elevate"
                data-testid="button-share-facebook"
              >
                <SiFacebook className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleSocialShare("whatsapp")}
                className="hover-elevate"
                data-testid="button-share-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleSocialShare("linkedin")}
                className="hover-elevate"
                data-testid="button-share-linkedin"
              >
                <SiLinkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
