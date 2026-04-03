import { useEffect, useRef, useState } from "react";

type PitchStatus = "idle" | "flat" | "onPitch" | "sharp" | "listening" | "noSignal" | "unsupported";

export type PitchSessionSummary = {
  score: number;
  accuracy: number;
  bestStreak: number;
  samples: number;
  flatMoments: number;
  sharpMoments: number;
  onPitchMoments: number;
  averageCentsOff: number | null;
  endedAt: number;
};

type PitchSnapshot = {
  isListening: boolean;
  status: PitchStatus;
  note: string | null;
  frequency: number | null;
  centsOff: number | null;
  error: string | null;
  liveScore: number;
  streak: number;
  bestStreak: number;
  samples: number;
  lastSessionSummary: PitchSessionSummary | null;
};

type PitchMetrics = {
  sampleCount: number;
  totalQuality: number;
  streak: number;
  bestStreak: number;
  flatMoments: number;
  sharpMoments: number;
  onPitchMoments: number;
  totalAbsCents: number;
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    const value = buffer[index];
    rms += value * value;
  }

  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.0045) {
    return null;
  }

  const correlations = new Float32Array(buffer.length);

  for (let offset = 0; offset < buffer.length; offset += 1) {
    let correlation = 0;

    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation += buffer[index] * buffer[index + offset];
    }

    correlations[offset] = correlation;
  }

  let firstDip = 0;
  while (
    firstDip < correlations.length - 2 &&
    correlations[firstDip] > correlations[firstDip + 1]
  ) {
    firstDip += 1;
  }

  let bestOffset = -1;
  let bestCorrelation = -1;
  for (let offset = firstDip; offset < correlations.length; offset += 1) {
    if (correlations[offset] > bestCorrelation) {
      bestCorrelation = correlations[offset];
      bestOffset = offset;
    }
  }

  if (bestOffset <= 0 || bestOffset >= correlations.length - 1) {
    return null;
  }

  const left = correlations[bestOffset - 1];
  const center = correlations[bestOffset];
  const right = correlations[bestOffset + 1];
  const denominator = left - 2 * center + right;
  const shift = denominator === 0 ? 0 : 0.5 * (left - right) / denominator;
  const refinedOffset = bestOffset + shift;

  if (!Number.isFinite(refinedOffset) || refinedOffset <= 0) {
    return null;
  }

  return sampleRate / refinedOffset;
}

function toPitchData(frequency: number) {
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));
  const noteIndex = ((midiNote % 12) + 12) % 12;
  const nearestFrequency = 440 * 2 ** ((midiNote - 69) / 12);
  const centsOff = Math.round(1200 * Math.log2(frequency / nearestFrequency));

  return {
    note: NOTE_NAMES[noteIndex],
    centsOff,
  };
}

export function usePitchDetector() {
  const [snapshot, setSnapshot] = useState<PitchSnapshot>({
    isListening: false,
    status: "idle",
    note: null,
    frequency: null,
    centsOff: null,
    error: null,
    liveScore: 0,
    streak: 0,
    bestStreak: 0,
    samples: 0,
    lastSessionSummary: null,
  });

  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previousFrequencyRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const missingSignalFramesRef = useRef(0);
  const metricsRef = useRef<PitchMetrics>({
    sampleCount: 0,
    totalQuality: 0,
    streak: 0,
    bestStreak: 0,
    flatMoments: 0,
    sharpMoments: 0,
    onPitchMoments: 0,
    totalAbsCents: 0,
  });

  const resetMetrics = () => {
    metricsRef.current = {
      sampleCount: 0,
      totalQuality: 0,
      streak: 0,
      bestStreak: 0,
      flatMoments: 0,
      sharpMoments: 0,
      onPitchMoments: 0,
      totalAbsCents: 0,
    };
  };

  const stopListening = () => {
    const metrics = metricsRef.current;
    const lastSessionSummary =
      metrics.sampleCount > 0
        ? {
            score: Math.round((metrics.totalQuality / metrics.sampleCount) * 100),
            accuracy: Math.round((metrics.onPitchMoments / metrics.sampleCount) * 100),
            bestStreak: metrics.bestStreak,
            samples: metrics.sampleCount,
            flatMoments: metrics.flatMoments,
            sharpMoments: metrics.sharpMoments,
            onPitchMoments: metrics.onPitchMoments,
            averageCentsOff: Number((metrics.totalAbsCents / metrics.sampleCount).toFixed(1)),
            endedAt: Date.now(),
          }
        : null;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    previousFrequencyRef.current = null;
    missingSignalFramesRef.current = 0;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setSnapshot((current) => ({
      ...current,
      isListening: false,
      status: current.status === "unsupported" ? "unsupported" : "idle",
      lastSessionSummary: lastSessionSummary ?? current.lastSessionSummary,
    }));
  };

  const startListening = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSnapshot({
        isListening: false,
        status: "unsupported",
        note: null,
        frequency: null,
        centsOff: null,
        error: "Microphone access is not supported in this browser.",
        liveScore: 0,
        streak: 0,
        bestStreak: 0,
        samples: 0,
        lastSessionSummary: null,
      });
      return;
    }

    stopListening();
    resetMetrics();

    try {
      const supportedConstraints = navigator.mediaDevices.getSupportedConstraints?.() ?? {};
      const preferredConstraints: MediaTrackConstraints = {
        echoCancellation: supportedConstraints.echoCancellation ? false : undefined,
        noiseSuppression: supportedConstraints.noiseSuppression ? false : undefined,
        autoGainControl: supportedConstraints.autoGainControl ? false : undefined,
        channelCount: supportedConstraints.channelCount ? 1 : undefined,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: preferredConstraints });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) {
        throw new Error("Web Audio is not available in this browser.");
      }

      const audioContext = new AudioContextCtor();
      await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.15;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const tick = () => {
        const activeAnalyser = analyserRef.current;
        const activeContext = audioContextRef.current;

        if (!activeAnalyser || !activeContext) {
          return;
        }

        activeAnalyser.getFloatTimeDomainData(buffer);
        const detectedFrequency = autoCorrelate(buffer, activeContext.sampleRate);

        if (!detectedFrequency || detectedFrequency < 50 || detectedFrequency > 1200) {
          missingSignalFramesRef.current += 1;

          if (missingSignalFramesRef.current >= 10) {
            previousFrequencyRef.current = null;
            setSnapshot((current) => ({
              ...current,
              isListening: true,
              status: "noSignal",
              note: null,
              frequency: null,
              centsOff: null,
              error: null,
            }));
          }
        } else {
          missingSignalFramesRef.current = 0;
          const metrics = metricsRef.current;
          const smoothedFrequency = previousFrequencyRef.current
            ? previousFrequencyRef.current * 0.7 + detectedFrequency * 0.3
            : detectedFrequency;
          previousFrequencyRef.current = smoothedFrequency;

          const pitchData = toPitchData(smoothedFrequency);
          const absoluteCents = Math.abs(pitchData.centsOff);

          let status: PitchStatus = "onPitch";
          if (pitchData.centsOff < -15) {
            status = "flat";
          } else if (pitchData.centsOff > 15) {
            status = "sharp";
          } else if (absoluteCents > 5) {
            status = "listening";
          }

          metrics.sampleCount += 1;
          metrics.totalQuality += Math.max(0, 1 - Math.min(absoluteCents, 55) / 55);
          metrics.totalAbsCents += absoluteCents;

          if (status === "flat") {
            metrics.flatMoments += 1;
            metrics.streak = 0;
          } else if (status === "sharp") {
            metrics.sharpMoments += 1;
            metrics.streak = 0;
          } else {
            if (status === "onPitch") {
              metrics.onPitchMoments += 1;
            }

            metrics.streak += 1;
            metrics.bestStreak = Math.max(metrics.bestStreak, metrics.streak);
          }

          setSnapshot({
            isListening: true,
            status,
            note: pitchData.note,
            frequency: Number(smoothedFrequency.toFixed(1)),
            centsOff: pitchData.centsOff,
            error: null,
            liveScore: Math.round((metrics.totalQuality / metrics.sampleCount) * 100),
            streak: metrics.streak,
            bestStreak: metrics.bestStreak,
            samples: metrics.sampleCount,
            lastSessionSummary: null,
          });
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      };

      setSnapshot({
        isListening: true,
        status: "listening",
        note: null,
        frequency: null,
        centsOff: null,
        error: null,
        liveScore: 0,
        streak: 0,
        bestStreak: 0,
        samples: 0,
        lastSessionSummary: null,
      });

      tick();
      detectionIntervalRef.current = window.setInterval(() => {
        if (!audioContextRef.current && detectionIntervalRef.current) {
          window.clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
      }, 1000);
    } catch (error) {
      setSnapshot({
        isListening: false,
        status: "idle",
        note: null,
        frequency: null,
        centsOff: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to access the microphone. Check browser permission and input device settings.",
        liveScore: 0,
        streak: 0,
        bestStreak: 0,
        samples: 0,
        lastSessionSummary: null,
      });
    }
  };

  useEffect(() => stopListening, []);

  return {
    ...snapshot,
    startListening,
    stopListening,
  };
}
