import { useRef, useCallback, useState, useEffect } from "react";

export interface AudioEffectSettings {
  pitch: number;
  voiceclone: number;
  reverb: number;
}

export function useAudioProcessor() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const createReverbImpulse = useCallback((ctx: AudioContext, duration: number, decay: number) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }, []);

  const loadAudio = useCallback(async (audioUrl: string) => {
    const ctx = initAudioContext();
    
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      return audioBuffer;
    } catch (error) {
      console.error("Error loading audio:", error);
      return null;
    }
  }, [initAudioContext]);

  const updateTimeDisplay = useCallback(() => {
    if (audioContextRef.current && isPlaying) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pausedAtRef.current;
      setCurrentTime(Math.min(elapsed, duration));
      animationFrameRef.current = requestAnimationFrame(updateTimeDisplay);
    }
  }, [isPlaying, duration]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTimeDisplay);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateTimeDisplay]);

  const playWithEffects = useCallback(async (
    audioUrl: string,
    effects: AudioEffectSettings
  ) => {
    const ctx = initAudioContext();
    
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }

    let buffer = audioBufferRef.current;
    if (!buffer) {
      buffer = await loadAudio(audioUrl);
      if (!buffer) return;
    }

    const pitchRate = Math.pow(2, effects.pitch / 12);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitchRate;
    sourceNodeRef.current = source;

    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.value = 1;

    dryGainRef.current = ctx.createGain();
    reverbGainRef.current = ctx.createGain();
    convolverNodeRef.current = ctx.createConvolver();

    const reverbAmount = effects.reverb / 100;
    dryGainRef.current.gain.value = 1 - reverbAmount * 0.5;
    reverbGainRef.current.gain.value = reverbAmount;

    const reverbDuration = 2 + (effects.reverb / 100) * 3;
    const decay = 2 + (effects.reverb / 100) * 2;
    convolverNodeRef.current.buffer = createReverbImpulse(ctx, reverbDuration, decay);

    const voiceCloneAmount = effects.voiceclone / 100;
    if (voiceCloneAmount > 0) {
      const formantShift = 1 + voiceCloneAmount * 0.3;
      source.playbackRate.value = pitchRate * formantShift;
      
      gainNodeRef.current.gain.value = 1 + voiceCloneAmount * 0.2;
    }

    source.connect(dryGainRef.current);
    dryGainRef.current.connect(gainNodeRef.current);

    source.connect(convolverNodeRef.current);
    convolverNodeRef.current.connect(reverbGainRef.current);
    reverbGainRef.current.connect(gainNodeRef.current);

    gainNodeRef.current.connect(ctx.destination);

    startTimeRef.current = ctx.currentTime;
    source.start(0, pausedAtRef.current);
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      pausedAtRef.current = 0;
    };
  }, [initAudioContext, loadAudio, createReverbImpulse]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    pausedAtRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    if (sourceNodeRef.current && audioContextRef.current) {
      pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current + pausedAtRef.current;
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const updateEffects = useCallback((effects: AudioEffectSettings) => {
    if (!audioContextRef.current) return;

    if (sourceNodeRef.current) {
      const pitchRate = Math.pow(2, effects.pitch / 12);
      const voiceCloneAmount = effects.voiceclone / 100;
      const formantShift = voiceCloneAmount > 0 ? 1 + voiceCloneAmount * 0.3 : 1;
      sourceNodeRef.current.playbackRate.value = pitchRate * formantShift;
    }

    if (dryGainRef.current && reverbGainRef.current) {
      const reverbAmount = effects.reverb / 100;
      dryGainRef.current.gain.value = 1 - reverbAmount * 0.5;
      reverbGainRef.current.gain.value = reverbAmount;
    }

    if (gainNodeRef.current) {
      const voiceCloneAmount = effects.voiceclone / 100;
      gainNodeRef.current.gain.value = 1 + voiceCloneAmount * 0.2;
    }
  }, []);

  const cleanup = useCallback(() => {
    stop();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stop]);

  return {
    isPlaying,
    currentTime,
    duration,
    loadAudio,
    playWithEffects,
    stop,
    pause,
    updateEffects,
    cleanup
  };
}
