import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Upload, Play, Pause, X, Check, Square } from "lucide-react";

interface AudioRecorderProps {
  onRecord: (blob: Blob) => void;
  onUpload: (file: File) => void;
  audioUrl: string | null;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  onClear: () => void;
}

export function AudioRecorder({ 
  onRecord, 
  onUpload, 
  audioUrl, 
  isRecording,
  setIsRecording,
  onClear 
}: AudioRecorderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [onRecord, setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, setIsRecording]);

  const togglePlayback = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
          
          <Progress value={playbackProgress} className="h-1" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(Math.floor((playbackProgress / 100) * (audioRef.current?.duration || 0)))}</span>
            <span>{formatTime(Math.floor(audioRef.current?.duration || 0))}</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Audio loaded and ready for voice effects
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex flex-col items-center gap-4">
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
