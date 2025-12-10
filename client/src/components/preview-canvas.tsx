import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Camera, 
  CameraOff, 
  Maximize2, 
  Sparkles,
  Image,
  User,
  Loader2
} from "lucide-react";
import type { Effect } from "@/pages/home";
import { loadFaceDetectionModels, detectFaces, isModelLoaded, type FaceDetectionResult } from "@/lib/face-detection";

interface PreviewCanvasProps {
  uploadedPhoto: string | null;
  webcamEnabled: boolean;
  isPrankMode: boolean;
  faceEffects: Effect[];
}

function applyFilters(faceEffects: Effect[]): { filters: string[]; alpha: number } {
  const filters: string[] = [];
  let alpha = 1;
  
  faceEffects.filter(e => e.active).forEach(effect => {
    const mult = effect.intensity / 100;
    switch (effect.id) {
      case "beauty":
        filters.push(`contrast(${1 + 0.2 * mult})`, `brightness(${1 + 0.1 * mult})`, `saturate(${1 + 0.2 * mult})`);
        break;
      case "aging":
        filters.push(`sepia(${0.6 * mult})`, `contrast(${1 + 0.2 * mult})`, `brightness(${1 - 0.2 * mult})`);
        break;
      case "expression":
        filters.push(`hue-rotate(${20 * mult}deg)`, `saturate(${1 + 0.4 * mult})`);
        break;
      case "faceswap":
        alpha = 1 - (0.3 * mult);
        filters.push(`blur(${2 * mult}px)`);
        break;
      case "vintage":
        filters.push(`sepia(${0.5 * mult})`, `saturate(${1 - 0.3 * mult})`, `contrast(${1 + 0.1 * mult})`);
        break;
      case "noir":
        filters.push(`grayscale(${mult})`, `contrast(${1 + 0.3 * mult})`);
        break;
      case "glow":
        filters.push(`brightness(${1 + 0.3 * mult})`, `saturate(${1 + 0.5 * mult})`);
        break;
      case "sharpen":
        filters.push(`contrast(${1 + 0.3 * mult})`);
        break;
    }
  });
  
  return { filters, alpha };
}

export function PreviewCanvas({ 
  uploadedPhoto, 
  webcamEnabled, 
  isPrankMode,
  faceEffects 
}: PreviewCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [hasWebcamError, setHasWebcamError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDetectingFaces, setIsDetectingFaces] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      if (!isModelLoaded()) {
        setIsLoadingModels(true);
        setModelLoadError(null);
        try {
          await loadFaceDetectionModels();
          setModelsReady(true);
        } catch (error) {
          console.error("Failed to load face detection models:", error);
          setModelLoadError("Face detection models failed to load");
        }
        setIsLoadingModels(false);
      } else {
        setModelsReady(true);
      }
    };
    loadModels();
  }, []);

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
    let lastDetectionTime = 0;
    const DETECTION_INTERVAL = 200;

    const draw = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const { filters, alpha } = applyFilters(faceEffects);
        
        ctx.save();
        ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
        ctx.globalAlpha = alpha;
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        const now = Date.now();
        if (isModelLoaded() && now - lastDetectionTime > DETECTION_INTERVAL) {
          lastDetectionTime = now;
          try {
            const result = await detectFaces(videoRef.current);
            setFaceDetectionResult(result);
            
            if (result.detected && result.faces.length > 0) {
              ctx.save();
              ctx.scale(-1, 1);
              result.faces.forEach((face, index) => {
                const box = face.box;
                const mirroredX = -box.x - box.width;
                
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(mirroredX, box.y, box.width, box.height);
                
                if (result.landmarks && result.landmarks[index]) {
                  const landmarks = result.landmarks[index];
                  ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
                  const positions = landmarks.positions;
                  positions.forEach(pos => {
                    ctx.beginPath();
                    ctx.arc(-pos.x, pos.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                  });
                }
              });
              ctx.restore();
            }
          } catch (error) {
            console.error("Face detection error:", error);
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [webcamEnabled, faceEffects]);

  useEffect(() => {
    if (!uploadedPhoto || webcamEnabled) {
      setFaceDetectionResult(null);
      return;
    }

    const processImage = async () => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = uploadedPhoto;
      });

      imageRef.current = img;
      
      if (photoCanvasRef.current) {
        const canvas = photoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          
          const { filters, alpha } = applyFilters(faceEffects);
          
          ctx.save();
          ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
          ctx.globalAlpha = alpha;
          ctx.drawImage(img, 0, 0);
          ctx.restore();
          
          if (modelsReady) {
            setIsDetectingFaces(true);
            try {
              const result = await detectFaces(img);
              setFaceDetectionResult(result);
              
              if (result.detected && result.faces.length > 0) {
                result.faces.forEach((face, index) => {
                  const box = face.box;
                  
                  ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
                  ctx.lineWidth = Math.max(2, img.width / 300);
                  ctx.setLineDash([5, 5]);
                  ctx.strokeRect(box.x, box.y, box.width, box.height);
                  
                  if (result.landmarks && result.landmarks[index]) {
                    const landmarks = result.landmarks[index];
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
                    const positions = landmarks.positions;
                    const pointSize = Math.max(2, img.width / 400);
                    positions.forEach(pos => {
                      ctx.beginPath();
                      ctx.arc(pos.x, pos.y, pointSize, 0, Math.PI * 2);
                      ctx.fill();
                    });
                  }
                });
              }
            } catch (error) {
              console.error("Face detection error:", error);
            }
            setIsDetectingFaces(false);
          }
        }
      }
    };
    
    processImage().catch(console.error);
  }, [uploadedPhoto, webcamEnabled, faceEffects, modelsReady]);

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
            <canvas
              ref={photoCanvasRef}
              className={cn(
                "w-full h-full object-contain transition-all duration-300",
                faceEffects.find(e => e.id === "glow" && e.active) && "drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              )}
              data-testid="canvas-photo-preview"
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

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {activeEffectCount > 0 && (
            <Badge variant="secondary" className="gap-1.5 bg-neon-purple/20 text-neon-purple border-neon-purple/30" data-testid="badge-active-effects">
              <Sparkles className="w-3 h-3" />
              {activeEffectCount} effect{activeEffectCount > 1 ? "s" : ""} active
            </Badge>
          )}
          
          {isLoadingModels && (
            <Badge variant="secondary" className="gap-1.5 bg-amber-500/20 text-amber-400 border-amber-500/30" data-testid="badge-loading-models">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading AI models...
            </Badge>
          )}
          
          {isDetectingFaces && (
            <Badge variant="secondary" className="gap-1.5 bg-blue-500/20 text-blue-400 border-blue-500/30" data-testid="badge-detecting-faces">
              <Loader2 className="w-3 h-3 animate-spin" />
              Detecting faces...
            </Badge>
          )}
          
          {!isLoadingModels && !isDetectingFaces && faceDetectionResult && (uploadedPhoto || webcamEnabled) && (
            <Badge 
              variant="secondary" 
              className={cn(
                "gap-1.5",
                faceDetectionResult.detected 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-muted/50 text-muted-foreground border-border"
              )} 
              data-testid="badge-face-detection"
            >
              <User className="w-3 h-3" />
              {faceDetectionResult.detected 
                ? `${faceDetectionResult.faces.length} face${faceDetectionResult.faces.length > 1 ? "s" : ""} detected` 
                : "No faces detected"}
            </Badge>
          )}
          
          {modelLoadError && (
            <Badge variant="secondary" className="gap-1.5 bg-red-500/20 text-red-400 border-red-500/30" data-testid="badge-model-error">
              AI unavailable
            </Badge>
          )}
        </div>

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
