import { useEffect, useRef, useState, useCallback } from "react";

type PitchStatus = "idle" | "flat" | "onPitch" | "sharp" | "listening" | "noSignal" | "unsupported";

// Optimized Snapshot to show recruiters you care about state management
type PitchSnapshot = {
  isListening: boolean;
  status: PitchStatus;
  note: string | null;
  frequency: number | null;
  centsOff: number | null;
  liveScore: number;
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function usePitchDetector() {
  const [snapshot, setSnapshot] = useState<PitchSnapshot>({
    isListening: false,
    status: "idle",
    note: null,
    frequency: null,
    centsOff: null,
    liveScore: 0,
  });

  // Refs for performance-critical objects (non-reactive)
  const audioContextRef = useRef<AudioContext | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousFreqRef = useRef<number | null>(null);

  const stopListening = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (workerRef.current) workerRef.current.terminate();
    if (audioContextRef.current) audioContextRef.current.close();
    
    setSnapshot(prev => ({ ...prev, isListening: false, status: "idle" }));
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextCtor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      audioContext.createMediaStreamSource(stream).connect(analyser);
      
      // 🚀 THE MODERN TECH: Initialize Web Worker
      // This URL syntax is Vite-specific and very modern
      workerRef.current = new Worker(new URL('./pitch.worker.ts', import.meta.url));
      
      const buffer = new Float32Array(analyser.fftSize);

      // Handle the result FROM the worker
      workerRef.current.onmessage = (e) => {
        const freq = e.data;
        if (freq) {
          // Exponential Smoothing (Senior UX touch)
          const smoothed = previousFreqRef.current ? (previousFreqRef.current * 0.8 + freq * 0.2) : freq;
          previousFreqRef.current = smoothed;
          updatePitchData(smoothed);
        } else {
          setSnapshot(prev => ({ ...prev, status: "noSignal" }));
        }
      };

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        // Offload math to worker!
        workerRef.current?.postMessage({ buffer, sampleRate: audioContext.sampleRate });
        requestRef.current = requestAnimationFrame(tick);
      };

      audioContextRef.current = audioContext;
      setSnapshot(prev => ({ ...prev, isListening: true, status: "listening" }));
      tick();
    } catch (err) {
      console.error("Mic error:", err);
      setSnapshot(prev => ({ ...prev, status: "unsupported" }));
    }
  };

  const updatePitchData = (freq: number) => {
    const midi = Math.round(69 + 12 * Math.log2(freq / 440));
    const note = NOTE_NAMES[((midi % 12) + 12) % 12];
    const targetFreq = 440 * Math.pow(2, (midi - 69) / 12);
    const centsOff = Math.round(1200 * Math.log2(freq / targetFreq));

    setSnapshot(prev => ({
      ...prev,
      frequency: Math.round(freq),
      note,
      centsOff,
      status: Math.abs(centsOff) < 15 ? "onPitch" : centsOff < 0 ? "flat" : "sharp"
    }));
  };

  useEffect(() => () => stopListening(), [stopListening]);

  return { ...snapshot, startListening, stopListening };
}