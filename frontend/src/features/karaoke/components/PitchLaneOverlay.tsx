import React, { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils"; // Using our new alias/util
import { frequencyToMidiFloat } from "../../../shared/lib/pitch";
import type { PitchGuideNote } from "@/shared/types/pitch-guide";

type PitchLaneOverlayProps = {
  songTitle?: string | null;
  artist?: string | null;
  pitchGuide: PitchGuideNote[];
  pitchStatus: string;
  currentTime: number;
  frequency: number | null;
  liveScore: number;
  streak: number;
};

// Viewing window settings
const LOOKBACK = 1.2;
const LOOKAHEAD = 6.8;
const WINDOW = LOOKBACK + LOOKAHEAD;

export function PitchLaneOverlay({
  songTitle, artist, pitchGuide, pitchStatus,
  currentTime, frequency, liveScore, streak 
}: PitchLaneOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pitchGuide.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // 1. Calculate MIDI Range (Dynamic Zoom)
      const visibleNotes = pitchGuide.filter(n => 
        n.endTimeSeconds >= currentTime - LOOKBACK && n.startTimeSeconds <= currentTime + LOOKAHEAD
      );
      
      const midis = visibleNotes.map(n => n.midiNote);
      const minMidi = Math.min(...midis, 60) - 3;
      const maxMidi = Math.max(...midis, 72) + 3;
      const getPity = (midi: number) => ((maxMidi - midi) / (maxMidi - minMidi)) * height;

      // 2. Draw Target Notes (The "Rail")
      visibleNotes.forEach(note => {
        const x = ((note.startTimeSeconds - (currentTime - LOOKBACK)) / WINDOW) * width;
        const w = ((note.endTimeSeconds - note.startTimeSeconds) / WINDOW) * width;
        const y = getPity(note.midiNote);
        const isActive = currentTime >= note.startTimeSeconds && currentTime <= note.endTimeSeconds;

        ctx.fillStyle = isActive ? "#86efac" : "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.roundRect(x, y - 10, Math.max(w, 40), 20, 10);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.fillText(note.lyricChunk, x + 8, y + 5);
      });

      // 3. Draw Playhead Line
      const playheadX = (LOOKBACK / WINDOW) * width;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(playheadX, 0); ctx.lineTo(playheadX, height); ctx.stroke();
      ctx.setLineDash([]); // Reset

      // 4. Draw Singer Orb
      if (frequency && frequency > 0) {
        const singerMidi = frequencyToMidiFloat(frequency);
        const singerY = getPity(singerMidi);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(playheadX, singerY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
    };

    const frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [currentTime, frequency, pitchGuide]);

  return (
    <div className="absolute inset-0 pointer-events-none bg-slate-950 font-sans">
      {/* Header HUD */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
        <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <h1 className="text-xl font-black text-white tracking-tight italic uppercase">
            {songTitle || "Live Session"}
          </h1>
          <p className="text-xs text-sky-400 font-bold tracking-widest uppercase opacity-70">
            {artist || "Studio Mode"}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-3 rounded-full bg-slate-900 border border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-white/40 font-bold uppercase">Accuracy</span>
            <span className="text-2xl font-black text-white">{liveScore}%</span>
          </div>
          <div className="px-6 py-3 rounded-full bg-slate-900 border border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-white/40 font-bold uppercase">Streak</span>
            <span className="text-2xl font-black text-orange-400">{streak}</span>
          </div>
        </div>
      </div>

      {/* The Rendering Stage */}
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight} 
        className="w-full h-full opacity-90"
      />

      {/* Status Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        <p className="text-sm font-medium text-white/80 tracking-wide">
          Status: <span className="text-sky-400 font-bold uppercase">{pitchStatus}</span>
        </p>
      </div>
    </div>
  );
}