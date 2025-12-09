import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Sparkles, Volume2, Wand2, Zap, RefreshCw } from "lucide-react";
import type { Effect, AudioEffect } from "@/pages/home";

interface EffectsPanelProps {
  faceEffects: Effect[];
  audioEffects: AudioEffect[];
  onToggleEffect: (id: string) => void;
  onUpdateAudioEffect: (id: string, value: number) => void;
}

const effectIcons: Record<string, typeof Sparkles> = {
  faceswap: RefreshCw,
  aging: Wand2,
  beauty: Sparkles,
  expression: Zap,
};

export function EffectsPanel({
  faceEffects,
  audioEffects,
  onToggleEffect,
  onUpdateAudioEffect,
}: EffectsPanelProps) {
  return (
    <Card className="gradient-border p-6">
      <Tabs defaultValue="face">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="face" className="gap-2" data-testid="tab-face-effects">
            <Wand2 className="w-4 h-4" />
            Face
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2" data-testid="tab-audio-effects">
            <Volume2 className="w-4 h-4" />
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="mt-0 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Face Effects</h3>
          <div className="grid grid-cols-2 gap-2">
            {faceEffects.map((effect) => {
              const Icon = effectIcons[effect.id] || Sparkles;
              return (
                <button
                  key={effect.id}
                  onClick={() => onToggleEffect(effect.id)}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2",
                    "hover-elevate active-elevate-2",
                    effect.active
                      ? "border-neon-purple/50 bg-neon-purple/10"
                      : "border-border bg-card"
                  )}
                  data-testid={`button-effect-${effect.id}`}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    effect.active ? "bg-neon-purple/20" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      effect.active ? "text-neon-purple" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    effect.active ? "text-neon-purple" : "text-muted-foreground"
                  )}>
                    {effect.name}
                  </span>
                  {effect.active && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Click effects to toggle them on/off
          </p>
        </TabsContent>

        <TabsContent value="audio" className="mt-0 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Audio Effects</h3>
          {audioEffects.map((effect) => (
            <div key={effect.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{effect.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {effect.id === "pitch" 
                    ? `${effect.value > 0 ? "+" : ""}${effect.value} semitones`
                    : effect.id === "voiceclone"
                    ? `${effect.value}% clone`
                    : `${effect.value}%`}
                </span>
              </div>
              <Slider
                value={[effect.value]}
                min={effect.min}
                max={effect.max}
                step={effect.step}
                onValueChange={([value]) => onUpdateAudioEffect(effect.id, value)}
                className="w-full"
                data-testid={`slider-${effect.id}`}
              />
            </div>
          ))}
          <div className="pt-2 border-t border-border mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground"
              onClick={() => {
                audioEffects.forEach(effect => {
                  onUpdateAudioEffect(effect.id, effect.id === "pitch" ? 0 : 0);
                });
              }}
              data-testid="button-reset-audio-effects"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
