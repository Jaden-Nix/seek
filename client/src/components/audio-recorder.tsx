import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Upload, Play, Pause, X, Check, Square } from "lucide-react";
import { useAudioProcessor, type AudioEffectSettings } from "@/hooks/use-audio-processor";

interface AudioRecorderProps {
  onRecord: (blob: Blob) => void;
  onUpload: (file: File) => void;
  audioUrl: string | null;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  onClear: () => void;
  audioEffects?: AudioEffectSettings;
}

export function AudioRecorder({ 
  onRecord, 
  onUpload, 
  audioUrl, 
  isRecording,
  setIsRecording,
  onClear,
  audioEffects = { pitch: 0, voiceclone: 0, reverb: 0 }
}: AudioRecorderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const audioProcessor = useAudioProcessor();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const updateProgress = () => {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      };
      const handleEnded = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      };
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioUrl]);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyzerRef.current) return;
      
      animationIdRef.current = requestAnimationFrame(draw);
      analyzer.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(10, 10, 15, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#a855f7";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  const generateStaticWaveform = useCallback(async (url: string) => {
    try {
      const audioContext = new AudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 50;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      const maxVal = Math.max(...filteredData);
      const normalizedData = filteredData.map(v => v / maxVal);
      setWaveformData(normalizedData);
      
      audioContext.close();
    } catch (error) {
      console.error("Error generating waveform:", error);
    }
  }, []);

  useEffect(() => {
    if (audioUrl) {
      generateStaticWaveform(audioUrl);
    } else {
      setWaveformData([]);
    }
  }, [audioUrl, generateStaticWaveform]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
      source.connect(analyzerRef.current);
      
      drawWaveform();
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecord(blob);
        stream.getTracks().forEach(track => track.stop());
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyzerRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [onRecord, setIsRecording, drawWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, setIsRecording]);

  useEffect(() => {
    if (audioProcessor.isPlaying) {
      audioProcessor.updateEffects(audioEffects);
    }
  }, [audioEffects, audioProcessor.isPlaying, audioProcessor.updateEffects]);

  useEffect(() => {
    setIsPlaying(audioProcessor.isPlaying);
    if (audioProcessor.duration > 0) {
      setPlaybackProgress((audioProcessor.currentTime / audioProcessor.duration) * 100);
    }
  }, [audioProcessor.isPlaying, audioProcessor.currentTime, audioProcessor.duration]);

  const togglePlayback = useCallback(async () => {
    if (!audioUrl) return;
    
    if (audioProcessor.isPlaying) {
      audioProcessor.pause();
      setIsPlaying(false);
    } else {
      await audioProcessor.playWithEffects(audioUrl, audioEffects);
      setIsPlaying(true);
    }
  }, [audioUrl, audioEffects, audioProcessor]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (audioUrl) {
    return (
      <div className="space-y-4 animate-fade-in">
        <audio ref={audioRef} src={audioUrl} />
        
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayback}
                className="bg-neon-purple/10"
                data-testid="button-toggle-playback"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-neon-purple" />
                ) : (
                  <Play className="w-4 h-4 text-neon-purple" />
                )}
              </Button>
              <div>
                <p className="text-sm font-medium">Audio Ready</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? "Playing..." : "Click to preview"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                data-testid="button-clear-audio"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {waveformData.length > 0 && (
            <div className="flex items-center justify-center gap-0.5 h-12 px-2" data-testid="container-waveform">
              {waveformData.map((value, index) => {
                const progress = playbackProgress / 100;
                const barProgress = index / waveformData.length;
                const isActive = barProgress <= progress;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-1 rounded-full transition-all duration-100",
                      isActive ? "bg-neon-purple" : "bg-muted-foreground/30"
                    )}
                    style={{
                      height: `${Math.max(4, value * 48)}px`
                    }}
                  />
                );
              })}
            </div>
          )}
          
          <Progress value={playbackProgress} className="h-1" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime((playbackProgress / 100) * (audioRef.current?.duration || 0))}</span>
            <span>{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {audioEffects.pitch !== 0 || audioEffects.reverb > 0 || audioEffects.voiceclone > 0
            ? "Voice effects applied - adjust sliders in Effects panel"
            : "Use the Audio Effects panel to apply pitch, reverb, and voice effects"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex flex-col items-center gap-4">
          {isRecording && (
            <canvas
              ref={canvasRef}
              width={200}
              height={60}
              className="rounded-lg border border-border bg-background/50"
              data-testid="canvas-waveform"
            />
          )}
          
          <div className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center transition-all",
            isRecording 
              ? "bg-red-500/20 animate-pulse-glow" 
              : "bg-muted"
          )}>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping" />
            )}
            {isRecording ? (
              <MicOff className="w-8 h-8 text-red-500" />
            ) : (
              <Mic className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {isRecording ? (
            <div className="text-center space-y-2">
              <p className="text-2xl font-display font-bold text-red-400" data-testid="text-recording-time">
                {formatTime(recordingTime)}
              </p>
              <Progress value={(recordingTime / 30) * 100} className="w-32 h-1" />
              <p className="text-xs text-muted-foreground">Max 30 seconds</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium">Record Audio</p>
              <p className="text-xs text-muted-foreground">10-30 seconds works best</p>
            </div>
          )}

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className={cn(
              "gap-2",
              !isRecording && "bg-neon-gradient"
            )}
            data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Recording
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => inputRef.current?.click()}
        data-testid="button-upload-audio"
      >
        <Upload className="w-4 h-4" />
        Upload Audio File
      </Button>
      
      <input
        ref={inputRef}
        type="file"
        accept="audio/wav,audio/mp3,audio/mpeg,audio/webm"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-audio-file"
      />

      <p className="text-xs text-muted-foreground text-center">
        WAV or MP3, 10-30 seconds recommended
      </p>
    </div>
  );
}
