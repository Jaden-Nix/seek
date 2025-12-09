import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, Image, X, Check } from "lucide-react";

interface PhotoUploadProps {
  onUpload: (file: File) => void;
  uploadedPhoto: string | null;
  onClear: () => void;
}

export function PhotoUpload({ onUpload, uploadedPhoto, onClear }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  if (uploadedPhoto) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="relative aspect-square rounded-xl overflow-hidden border border-border">
          <img 
            src={uploadedPhoto} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
            data-testid="img-uploaded-photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-xs text-white font-medium">Ready</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-black/40 backdrop-blur-sm"
              onClick={onClear}
              data-testid="button-clear-photo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Photo loaded and ready for face effects
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative aspect-square rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer",
          "flex flex-col items-center justify-center gap-3 p-6",
          isDragging 
            ? "border-neon-purple bg-neon-purple/10 scale-[1.02]" 
            : "border-border hover:border-neon-purple/50 hover:bg-muted/50"
        )}
        data-testid="dropzone-photo"
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
          isDragging ? "bg-neon-purple/20" : "bg-muted"
        )}>
          {isDragging ? (
            <Upload className="w-6 h-6 text-neon-purple animate-bounce" />
          ) : (
            <Image className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging ? "Drop your photo here" : "Upload a photo"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG or PNG, max 10MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-photo-file"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Upload a clear face photo for best results
      </p>
    </div>
  );
}
