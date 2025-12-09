import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShareModal } from "@/components/share-modal";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Square, 
  Download, 
  Video, 
  Camera,
  Mic,
  Image,
  Check,
  Loader2,
  Share2
} from "lucide-react";

interface ControlBarProps {
  isPrankMode: boolean;
  isExporting: boolean;
  uploadedPhoto: string | null;
  audioUrl: string | null;
  onStartPrank: () => void;
  onStopPrank: () => void;
  onExport: () => void;
}

export function ControlBar({
  isPrankMode,
  isExporting,
  uploadedPhoto,
  audioUrl,
  onStartPrank,
  onStopPrank,
  onExport,
}: ControlBarProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const hasPhoto = !!uploadedPhoto;
  const hasAudio = !!audioUrl;
  const canStart = hasPhoto;
  const canExport = hasPhoto || hasAudio;
  
  const handleExportForShare = async () => {
    await onExport();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                      hasPhoto ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                    )}
                    data-testid="status-photo"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-xs font-medium">Photo</span>
                    {hasPhoto && <Check className="w-3 h-3" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {hasPhoto ? "Photo uploaded" : "No photo uploaded"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                      hasAudio ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                    )}
                    data-testid="status-audio"
                  >
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-medium">Audio</span>
                    {hasAudio && <Check className="w-3 h-3" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {hasAudio ? "Audio recorded" : "No audio recorded"}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-3">
              {isPrankMode ? (
                <Button
                  onClick={onStopPrank}
                  variant="destructive"
                  className="gap-2 min-w-[140px]"
                  data-testid="button-stop-prank"
                >
                  <Square className="w-4 h-4" />
                  Stop Prank
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onStartPrank}
                      disabled={!canStart}
                      className={cn(
                        "gap-2 min-w-[140px]",
                        canStart && "bg-neon-gradient"
                      )}
                      data-testid="button-start-prank"
                    >
                      <Play className="w-4 h-4" />
                      Start Prank
                    </Button>
                  </TooltipTrigger>
                  {!canStart && (
                    <TooltipContent>
                      Upload a photo to start prank mode
                    </TooltipContent>
                  )}
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onExport}
                    disabled={!canExport || isExporting}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-export"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {!canExport && (
                  <TooltipContent>
                    Add photo or audio to export
                  </TooltipContent>
                )}
              </Tooltip>

              <Button
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                className="gap-2"
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-ready-status">
              <Video className="w-4 h-4" />
              <span>Ready to create awesome pranks</span>
            </div>
          </div>
        </div>
      </div>
      
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        hasPhoto={hasPhoto}
        hasAudio={hasAudio}
        onExportForShare={handleExportForShare}
        isExporting={isExporting}
      />
    </div>
  );
}
