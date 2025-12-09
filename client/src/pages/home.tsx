import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { PhotoUpload } from "@/components/photo-upload";
import { AudioRecorder } from "@/components/audio-recorder";
import { PreviewCanvas } from "@/components/preview-canvas";
import { EffectsPanel } from "@/components/effects-panel";
import { ControlBar } from "@/components/control-bar";
import { 
  Camera, 
  Mic, 
  Image, 
  Wand2, 
  Settings2, 
  Download,
  Play,
  Square,
  Video,
  Sparkles,
  Zap,
  Volume2,
  RefreshCw
} from "lucide-react";

export type Effect = {
  id: string;
  name: string;
  icon: typeof Sparkles;
  active: boolean;
  intensity: number;
};

export type AudioEffect = {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
};

export default function Home() {
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPrankMode, setIsPrankMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("photo");
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  
  const [faceEffects, setFaceEffects] = useState<Effect[]>([
    { id: "faceswap", name: "Face Swap", icon: RefreshCw, active: false, intensity: 50 },
    { id: "aging", name: "Aging", icon: Wand2, active: false, intensity: 50 },
    { id: "beauty", name: "Beauty Filter", icon: Sparkles, active: false, intensity: 50 },
    { id: "expression", name: "Expression Morph", icon: Zap, active: false, intensity: 50 },
    { id: "vintage", name: "Vintage", icon: Camera, active: false, intensity: 50 },
    { id: "noir", name: "Film Noir", icon: Video, active: false, intensity: 50 },
    { id: "glow", name: "Neon Glow", icon: Sparkles, active: false, intensity: 50 },
    { id: "sharpen", name: "Sharpen", icon: Zap, active: false, intensity: 50 },
  ]);

  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([
    { id: "pitch", name: "Pitch Shift", value: 0, min: -12, max: 12, step: 1 },
    { id: "voiceclone", name: "Voice Clone", value: 0, min: 0, max: 100, step: 5 },
    { id: "reverb", name: "Reverb", value: 0, min: 0, max: 100, step: 5 },
  ]);

  const handleDisclaimerAccept = useCallback(() => {
    setShowDisclaimer(false);
    toast({
      title: "Welcome to Seek",
      description: "Upload a photo and audio to get started!",
    });
  }, [toast]);

  const handlePhotoUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedPhoto(url);
    toast({
      title: "Photo uploaded",
      description: "Your photo is ready for effects!",
    });
  }, [toast]);

  const handleAudioRecord = useCallback((blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    toast({
      title: "Audio recorded",
      description: "Your audio clip is ready for processing!",
    });
  }, [toast]);

  const handleAudioUpload = useCallback((file: File) => {
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    toast({
      title: "Audio uploaded",
      description: "Your audio file is ready for processing!",
    });
  }, [toast]);

  const toggleEffect = useCallback((effectId: string) => {
    setFaceEffects(prev => prev.map(effect => 
      effect.id === effectId ? { ...effect, active: !effect.active } : effect
    ));
  }, []);

  const updateFaceEffectIntensity = useCallback((effectId: string, intensity: number) => {
    setFaceEffects(prev => prev.map(effect =>
      effect.id === effectId ? { ...effect, intensity } : effect
    ));
  }, []);

  const updateAudioEffect = useCallback((effectId: string, value: number) => {
    setAudioEffects(prev => prev.map(effect =>
      effect.id === effectId ? { ...effect, value } : effect
    ));
  }, []);

  const startPrankMode = useCallback(() => {
    if (!uploadedPhoto) {
      toast({
        title: "No photo uploaded",
        description: "Please upload a photo first to start prank mode.",
        variant: "destructive",
      });
      return;
    }
    setIsPrankMode(true);
    setWebcamEnabled(true);
    toast({
      title: "Prank Mode Active",
      description: "Effects are now being applied in real-time!",
    });
  }, [uploadedPhoto, toast]);

  const stopPrankMode = useCallback(() => {
    setIsPrankMode(false);
    toast({
      title: "Prank Mode Stopped",
      description: "Recording and effects have been stopped.",
    });
  }, [toast]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      if (uploadedPhoto) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = uploadedPhoto;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          const activeEffects = faceEffects.filter(e => e.active);
          const filters: string[] = [];
          let alpha = 1;
          
          activeEffects.forEach(effect => {
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
          
          ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
          ctx.globalAlpha = alpha;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `seek-prank-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, "image/png");
        }
        
        toast({
          title: "Image Exported",
          description: "Your processed image has been downloaded!",
        });
      } else if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `seek-audio-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Audio Exported",
          description: "Your audio clip has been downloaded!",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your content.",
        variant: "destructive",
      });
    }
    
    setIsExporting(false);
  }, [toast, uploadedPhoto, audioBlob, faceEffects]);

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <DisclaimerModal open={showDisclaimer} onAccept={handleDisclaimerAccept} />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="relative z-10 border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center neon-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold gradient-text neon-text-glow" data-testid="text-app-title">
                  Seek
                </h1>
                <p className="text-xs text-muted-foreground" data-testid="text-app-subtitle">Creative Effects Studio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isPrankMode && (
                <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse-glow" data-testid="badge-live-status">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                  LIVE
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-settings">
                    <Settings2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-6 animate-slide-up">
            <Card className="gradient-border p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="photo" className="gap-2" data-testid="tab-photo">
                    <Image className="w-4 h-4" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="gap-2" data-testid="tab-audio">
                    <Mic className="w-4 h-4" />
                    Audio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photo" className="mt-0">
                  <PhotoUpload 
                    onUpload={handlePhotoUpload}
                    uploadedPhoto={uploadedPhoto}
                    onClear={() => setUploadedPhoto(null)}
                  />
                </TabsContent>

                <TabsContent value="audio" className="mt-0">
                  <AudioRecorder
                    onRecord={handleAudioRecord}
                    onUpload={handleAudioUpload}
                    audioUrl={audioUrl}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    onClear={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    audioEffects={{
                      pitch: audioEffects.find(e => e.id === "pitch")?.value ?? 0,
                      voiceclone: audioEffects.find(e => e.id === "voiceclone")?.value ?? 0,
                      reverb: audioEffects.find(e => e.id === "reverb")?.value ?? 0,
                    }}
                  />
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="gradient-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm" data-testid="text-webcam-label">Webcam</h3>
                <Switch 
                  checked={webcamEnabled} 
                  onCheckedChange={setWebcamEnabled}
                  data-testid="switch-webcam"
                />
              </div>
              <p className="text-xs text-muted-foreground" data-testid="text-webcam-description">
                Enable webcam for live face tracking and real-time effects preview.
              </p>
            </Card>
          </aside>

          <div className="lg:col-span-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <PreviewCanvas
              uploadedPhoto={uploadedPhoto}
              webcamEnabled={webcamEnabled}
              isPrankMode={isPrankMode}
              faceEffects={faceEffects}
            />
          </div>

          <aside className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <EffectsPanel
              faceEffects={faceEffects}
              audioEffects={audioEffects}
              onToggleEffect={toggleEffect}
              onUpdateFaceEffectIntensity={updateFaceEffectIntensity}
              onUpdateAudioEffect={updateAudioEffect}
            />
          </aside>
        </div>
      </main>

      <ControlBar
        isPrankMode={isPrankMode}
        isExporting={isExporting}
        uploadedPhoto={uploadedPhoto}
        audioUrl={audioUrl}
        onStartPrank={startPrankMode}
        onStopPrank={stopPrankMode}
        onExport={handleExport}
      />
    </div>
  );
}
