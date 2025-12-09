import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Camera, 
  CameraOff, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Image,
  Zap
} from "lucide-react";
import type { Effect } from "@/pages/home";

interface PreviewCanvasProps {
  uploadedPhoto: string | null;
  webcamEnabled: boolean;
  isPrankMode: boolean;
  faceEffects: Effect[];
}

export function PreviewCanvas({ 
  uploadedPhoto, 
  webcamEnabled, 
  isPrankMode,
  faceEffects 
}: PreviewCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebcamError, setHasWebcamError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 1280, height: 720 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasWebcamError(false);
    } catch (error) {
      console.error("Webcam error:", error);
      setHasWebcamError(true);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (webcamEnabled) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [webcamEnabled, startWebcam, stopWebcam]);

  useEffect(() => {
    if (!webcamEnabled || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        const activeEffects = faceEffects.filter(e => e.active);
        
        if (activeEffects.some(e => e.id === "glow")) {
          ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
          ctx.shadowBlur = 20;
        }

        if (activeEffects.some(e => e.id === "pixelate")) {
          const pixelSize = 8;
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCanvas.width = canvas.width / pixelSize;
            tempCanvas.height = canvas.height / pixelSize;
            tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [webcamEnabled, faceEffects]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const activeEffectCount = faceEffects.filter(e => e.active).length;

  return (
    <Card className={cn(
      "gradient-border overflow-hidden transition-all duration-300",
      isFullscreen && "fixed inset-4 z-50"
    )}>
      <div className="relative aspect-video bg-black/50 scanline">
        {webcamEnabled && !hasWebcamError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-0"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="canvas-preview"
            />
          </>
        ) : uploadedPhoto ? (
          <div className="absolute inset-0">
            <img
              src={uploadedPhoto}
              alt="Preview"
              className={cn(
                "w-full h-full object-contain transition-all duration-300",
                faceEffects.find(e => e.id === "glow" && e.active) && "drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]",
                faceEffects.find(e => e.id === "blur" && e.active) && "blur-[2px]"
              )}
              style={{
                filter: faceEffects.find(e => e.id === "distort" && e.active) 
                  ? "hue-rotate(30deg) saturate(1.3)" 
                  : undefined,
                imageRendering: faceEffects.find(e => e.id === "pixelate" && e.active)
                  ? "pixelated"
                  : undefined
              }}
              data-testid="img-preview"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8" data-testid="container-no-preview">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Image className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-display font-semibold text-muted-foreground" data-testid="text-no-preview-title">
                No Preview Available
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-xs" data-testid="text-no-preview-description">
                Upload a photo or enable webcam to see the preview with effects
              </p>
            </div>
          </div>
        )}

        {hasWebcamError && webcamEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-red-500/10" data-testid="container-webcam-error">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-red-400" data-testid="text-webcam-error">Camera Access Denied</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Please allow camera access in your browser settings to use webcam features
              </p>
            </div>
          </div>
        )}

        {isPrankMode && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="default" className="bg-red-500 text-white gap-1.5" data-testid="badge-recording">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              REC
            </Badge>
          </div>
        )}

        {activeEffectCount > 0 && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="gap-1.5 bg-neon-purple/20 text-neon-purple border-neon-purple/30" data-testid="badge-active-effects">
              <Sparkles className="w-3 h-3" />
              {activeEffectCount} effect{activeEffectCount > 1 ? "s" : ""} active
            </Badge>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-sm"
            onClick={toggleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {(uploadedPhoto || webcamEnabled) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan opacity-50" />
        )}
      </div>
    </Card>
  );
}
