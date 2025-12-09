import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Sparkles, Volume2, Wand2, Zap, RefreshCw, Camera, Video, Save, Trash2, Palette, X } from "lucide-react";
import type { Effect, AudioEffect, EffectPreset } from "@/pages/home";

interface EffectsPanelProps {
  faceEffects: Effect[];
  audioEffects: AudioEffect[];
  onToggleEffect: (id: string) => void;
  onUpdateFaceEffectIntensity: (id: string, intensity: number) => void;
  onUpdateAudioEffect: (id: string, value: number) => void;
  presets: EffectPreset[];
  activePresetId: string | null;
  onApplyPreset: (preset: EffectPreset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (presetId: string) => void;
  onClearEffects: () => void;
}

const effectIcons: Record<string, typeof Sparkles> = {
  faceswap: RefreshCw,
  aging: Wand2,
  beauty: Sparkles,
  expression: Zap,
  vintage: Camera,
  noir: Video,
  glow: Sparkles,
  sharpen: Zap,
};

export function EffectsPanel({
  faceEffects,
  audioEffects,
  onToggleEffect,
  onUpdateFaceEffectIntensity,
  onUpdateAudioEffect,
  presets,
  activePresetId,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onClearEffects,
}: EffectsPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim());
      setNewPresetName("");
      setSaveDialogOpen(false);
    }
  };

  const hasActiveEffects = faceEffects.some(e => e.active);
  const builtInPresets = presets.filter(p => !p.isCustom);
  const customPresets = presets.filter(p => p.isCustom);

  return (
    <Card className="gradient-border p-6">
      <Tabs defaultValue="presets">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="presets" className="gap-1 text-xs" data-testid="tab-presets">
            <Palette className="w-3 h-3" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="face" className="gap-1 text-xs" data-testid="tab-face-effects">
            <Wand2 className="w-3 h-3" />
            Face
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1 text-xs" data-testid="tab-audio-effects">
            <Volume2 className="w-3 h-3" />
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="mt-0 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Effect Presets</h3>
            {hasActiveEffects && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearEffects}
                className="h-7 text-xs"
                data-testid="button-clear-effects"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Built-in Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {builtInPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset)}
                  className={cn(
                    "relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1",
                    "hover-elevate active-elevate-2",
                    activePresetId === preset.id
                      ? "border-neon-purple/50 bg-neon-purple/10"
                      : "border-border bg-card"
                  )}
                  data-testid={`button-preset-${preset.id}`}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    activePresetId === preset.id ? "bg-neon-purple/20" : "bg-muted"
                  )}>
                    <Palette className={cn(
                      "w-4 h-4 transition-colors",
                      activePresetId === preset.id ? "text-neon-purple" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors text-center leading-tight",
                    activePresetId === preset.id ? "text-neon-purple" : "text-muted-foreground"
                  )}>
                    {preset.name}
                  </span>
                  {activePresetId === preset.id && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {customPresets.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground">Your Presets</h4>
              <div className="space-y-2">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all",
                      activePresetId === preset.id
                        ? "border-neon-purple/50 bg-neon-purple/10"
                        : "border-border bg-card"
                    )}
                  >
                    <button
                      onClick={() => onApplyPreset(preset)}
                      className="flex-1 text-left flex items-center gap-2 hover-elevate active-elevate-2 rounded p-1"
                      data-testid={`button-preset-${preset.id}`}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        activePresetId === preset.id ? "bg-neon-purple/20" : "bg-muted"
                      )}>
                        <Save className={cn(
                          "w-3 h-3",
                          activePresetId === preset.id ? "text-neon-purple" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        activePresetId === preset.id ? "text-neon-purple" : "text-foreground"
                      )}>
                        {preset.name}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => onDeletePreset(preset.id)}
                      data-testid={`button-delete-preset-${preset.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!hasActiveEffects}
                  data-testid="button-save-preset"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Current as Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Effect Preset</DialogTitle>
                  <DialogDescription>
                    Give your custom effect combination a name to save it for later use.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                    data-testid="input-preset-name"
                  />
                  <div className="mt-3 text-xs text-muted-foreground">
                    Active effects: {faceEffects.filter(e => e.active).map(e => e.name).join(", ") || "None"}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePreset} disabled={!newPresetName.trim()} data-testid="button-confirm-save-preset">
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Click a preset to apply, or create your own combinations
          </p>
        </TabsContent>

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
                    "relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1",
                    "hover-elevate active-elevate-2",
                    effect.active
                      ? "border-neon-purple/50 bg-neon-purple/10"
                      : "border-border bg-card"
                  )}
                  data-testid={`button-effect-${effect.id}`}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    effect.active ? "bg-neon-purple/20" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4 transition-colors",
                      effect.active ? "text-neon-purple" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors text-center leading-tight",
                    effect.active ? "text-neon-purple" : "text-muted-foreground"
                  )}>
                    {effect.name}
                  </span>
                  {effect.active && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          
          {faceEffects.some(e => e.active) && (
            <div className="pt-3 border-t border-border space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground">Intensity Controls</h4>
              {faceEffects.filter(e => e.active).map((effect) => (
                <div key={effect.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{effect.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{effect.intensity}%</span>
                  </div>
                  <Slider
                    value={[effect.intensity]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={([value]) => onUpdateFaceEffectIntensity(effect.id, value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full"
                    data-testid={`slider-intensity-${effect.id}`}
                  />
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center pt-2">
            Click effects to toggle, adjust intensity with sliders
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
