import { centsFromTargetFrequency, frequencyToMidiFloat, midiToFrequency } from "../../../shared/lib/pitch";
import type { PitchGuideNote } from "../../../shared/types/pitch-guide";

type PitchLaneOverlayProps = {
  songTitle?: string | null;
  artist?: string | null;
  pitchGuide: PitchGuideNote[];
  pitchStatus: "idle" | "flat" | "onPitch" | "sharp" | "listening" | "noSignal" | "unsupported";
  currentTime: number;
  detectedNote: string | null;
  frequency: number | null;
  liveScore: number;
  streak: number;
};

const LANE_LOOKBACK_SECONDS = 1.2;
const LANE_LOOKAHEAD_SECONDS = 6.8;
const LANE_WINDOW_SECONDS = LANE_LOOKBACK_SECONDS + LANE_LOOKAHEAD_SECONDS;
const PLAYHEAD_PERCENT = (LANE_LOOKBACK_SECONDS / LANE_WINDOW_SECONDS) * 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function joinLyricChunks(notes: PitchGuideNote[], startIndex: number, count: number) {
  return notes
    .slice(startIndex, startIndex + count)
    .map((note) => note.lyricChunk)
    .filter(Boolean)
    .join(" ");
}

function getActiveTargetNote(notes: PitchGuideNote[], currentTime: number) {
  const active = notes.find((note) => currentTime >= note.startTimeSeconds && currentTime <= note.endTimeSeconds);
  if (active) {
    return active;
  }

  return notes.find((note) => note.startTimeSeconds >= currentTime) ?? notes[notes.length - 1] ?? null;
}

function statusBadge(status: PitchLaneOverlayProps["pitchStatus"]) {
  switch (status) {
    case "onPitch":
      return { label: "Voice locked", color: "#86efac" };
    case "flat":
      return { label: "Under target", color: "#fdba74" };
    case "sharp":
      return { label: "Over target", color: "#fda4af" };
    case "listening":
      return { label: "Finding center", color: "#fde68a" };
    case "noSignal":
      return { label: "No signal", color: "#cbd5e1" };
    case "unsupported":
      return { label: "Mic unavailable", color: "#fecaca" };
    default:
      return { label: "Mic off", color: "#cbd5e1" };
  }
}

function guideForSinger(
  pitchStatus: PitchLaneOverlayProps["pitchStatus"],
  targetCentsOff: number | null,
  activeNote: PitchGuideNote | null,
  nextNote: PitchGuideNote | null,
) {
  if (!activeNote) {
    return {
      headline: "Press play to wake the lane",
      detail: "The note rail is ready. Start playback and the target notes will glide under the playhead.",
      accent: "#67e8f9",
    };
  }

  if (pitchStatus === "unsupported") {
    return {
      headline: "Microphone unavailable",
      detail: `The target is ${activeNote.noteLabel} on "${activeNote.lyricChunk}", but the browser is not giving the app usable mic input.`,
      accent: "#fecaca",
    };
  }

  if (pitchStatus === "noSignal" || targetCentsOff === null) {
    return {
      headline: `Aim for ${activeNote.noteLabel}`,
      detail: `Sing "${activeNote.lyricChunk}" with one clean vowel. ${
        nextNote ? `"${nextNote.lyricChunk}" is coming next.` : "Hold the current phrase."
      }`,
      accent: "#67e8f9",
    };
  }

  if (targetCentsOff < -15) {
    return {
      headline: "Sing higher",
      detail: `You are below ${activeNote.noteLabel}. Lift your voice until the orb meets the target bar.`,
      accent: "#fdba74",
    };
  }

  if (targetCentsOff > 15) {
    return {
      headline: "Sing lower",
      detail: `You are above ${activeNote.noteLabel}. Relax downward and land back on the target bar.`,
      accent: "#fda4af",
    };
  }

  if (Math.abs(targetCentsOff) <= 7) {
    return {
      headline: "Hold that note",
      detail: `Beautiful. Stay on ${activeNote.noteLabel} and carry "${activeNote.lyricChunk}" through the playhead.`,
      accent: "#86efac",
    };
  }

  return {
    headline: "Center it smoothly",
    detail: `You are close to ${activeNote.noteLabel}. Smooth the note and let the orb settle into the target lane.`,
    accent: "#fde68a",
  };
}

function timeToLaneLeft(startTimeSeconds: number, currentTime: number) {
  const windowStart = currentTime - LANE_LOOKBACK_SECONDS;
  return ((startTimeSeconds - windowStart) / LANE_WINDOW_SECONDS) * 100;
}

export function PitchLaneOverlay({
  songTitle,
  artist,
  pitchGuide,
  pitchStatus,
  currentTime,
  detectedNote,
  frequency,
  liveScore,
  streak,
}: PitchLaneOverlayProps) {
  if (pitchGuide.length === 0) {
    return null;
  }

  const badge = statusBadge(pitchStatus);
  const activeNote = getActiveTargetNote(pitchGuide, currentTime);
  const activeIndex = activeNote ? pitchGuide.findIndex((note) => note.id === activeNote.id) : -1;
  const nextNote = activeIndex >= 0 ? pitchGuide[activeIndex + 1] ?? null : pitchGuide[0] ?? null;
  const targetCentsOff =
    frequency && activeNote ? centsFromTargetFrequency(frequency, midiToFrequency(activeNote.midiNote)) : null;
  const guide = guideForSinger(pitchStatus, targetCentsOff, activeNote, nextNote);
  const detectedMidi = frequency ? frequencyToMidiFloat(frequency) : null;
  const visibleNotes = pitchGuide.filter(
    (note) =>
      note.endTimeSeconds >= currentTime - LANE_LOOKBACK_SECONDS &&
      note.startTimeSeconds <= currentTime + LANE_LOOKAHEAD_SECONDS,
  );
  const rangeSource = [...visibleNotes.map((note) => note.midiNote), ...(typeof detectedMidi === "number" ? [detectedMidi] : [])];
  const rawMinMidi = rangeSource.length > 0 ? Math.min(...rangeSource) : 58;
  const rawMaxMidi = rangeSource.length > 0 ? Math.max(...rangeSource) : 68;
  const paddedRange = Math.max(8, rawMaxMidi - rawMinMidi + 4);
  const midiCenter = (rawMaxMidi + rawMinMidi) / 2;
  const minMidi = midiCenter - paddedRange / 2;
  const maxMidi = midiCenter + paddedRange / 2;
  const laneTopForMidi = (midi: number) => {
    const progress = (maxMidi - midi) / Math.max(maxMidi - minMidi, 1);
    return 14 + clamp(progress, 0, 1) * 62;
  };
  const singerOrbTop =
    typeof detectedMidi === "number" ? laneTopForMidi(detectedMidi) : activeNote ? laneTopForMidi(activeNote.midiNote) : 46;
  const currentPhrase =
    activeIndex >= 0 ? joinLyricChunks(pitchGuide, activeIndex, 3) : songTitle?.trim() || "Target lyric will appear here";
  const previewPhrase =
    activeIndex >= 0
      ? joinLyricChunks(pitchGuide, activeIndex + 3, 4) || "Next phrase will appear here."
      : artist?.trim() || "Add lyric timing later to make the lane follow the song phrase by phrase.";

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(242, 248, 248, 0.14), rgba(242, 248, 248, 0.05) 28%, rgba(2, 6, 23, 0.08) 56%, rgba(2, 6, 23, 0.54))",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            padding: "0.7rem 0.95rem",
            borderRadius: 18,
            background: "rgba(248, 252, 252, 0.78)",
            color: "#13303a",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.35)",
            boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14)",
          }}
        >
          <strong style={{ display: "block", fontSize: "1rem" }}>{songTitle ?? "Practice Stage"}</strong>
          <span style={{ opacity: 0.8 }}>
            {artist || "Unknown artist"}
            {activeNote ? ` | Target ${activeNote.noteLabel}` : ""}
          </span>
        </div>

        <div
          style={{
            padding: "0.55rem 0.85rem",
            borderRadius: 999,
            background: "rgba(248, 252, 252, 0.84)",
            color: "#173641",
            backdropFilter: "blur(10px)",
            fontWeight: 800,
            border: `1px solid ${badge.color}55`,
            boxShadow: "0 14px 28px rgba(15, 23, 42, 0.12)",
          }}
        >
          {badge.label}
        </div>
      </div>

      <div style={{ position: "absolute", top: 78, left: 18, right: 18, bottom: 124 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "10%",
              right: "4%",
              top: `${18 + index * 12}%`,
              height: 1,
              background: "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: `${PLAYHEAD_PERCENT}%`,
            top: "7%",
            bottom: "7%",
            width: 2,
            borderRadius: 999,
            background: "linear-gradient(180deg, rgba(56, 189, 248, 0.18), rgba(56, 189, 248, 0.92), rgba(56, 189, 248, 0.14))",
            boxShadow: "0 0 18px rgba(56, 189, 248, 0.4)",
          }}
        />

        {visibleNotes.map((note) => {
          const left = timeToLaneLeft(note.startTimeSeconds, currentTime);
          const width = ((note.endTimeSeconds - note.startTimeSeconds) / LANE_WINDOW_SECONDS) * 100;
          const isActive = activeNote?.id === note.id;
          const top = laneTopForMidi(note.midiNote);

          return (
            <div
              key={note.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${Math.max(width, 3.8)}%`,
                minWidth: 40,
                height: isActive ? 18 : 14,
                transform: "translateY(-50%)",
                borderRadius: 999,
                background: isActive
                  ? "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(216, 255, 248, 0.94))"
                  : "linear-gradient(90deg, rgba(232, 240, 240, 0.92), rgba(187, 224, 222, 0.84))",
                border: isActive ? "1px solid rgba(134, 239, 172, 0.9)" : "1px solid rgba(255,255,255,0.28)",
                boxShadow: isActive ? "0 0 18px rgba(134, 239, 172, 0.38)" : "0 10px 22px rgba(15, 23, 42, 0.12)",
                transition: "left 80ms linear, width 80ms linear, top 80ms linear",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "-1.55rem",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: isActive ? "#f8fafc" : "rgba(248, 250, 252, 0.74)",
                  whiteSpace: "nowrap",
                  textShadow: "0 4px 18px rgba(0,0,0,0.4)",
                }}
              >
                {note.lyricChunk}
              </span>
            </div>
          );
        })}

        {typeof detectedMidi === "number" ? (
          <div
            style={{
              position: "absolute",
              left: `${PLAYHEAD_PERCENT}%`,
              top: `${singerOrbTop}%`,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #ffffff, #8be9ff 68%, #38bdf8 100%)",
              boxShadow: "0 0 24px rgba(103, 232, 249, 0.62)",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(255,255,255,0.88)",
            }}
          />
        ) : null}
      </div>

      <div style={{ position: "absolute", left: 22, right: 22, bottom: 18, display: "grid", gap: "0.65rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "72%", paddingLeft: "10%" }}>
            <p
              style={{
                margin: "0 0 0.2rem",
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(248, 250, 252, 0.74)",
              }}
            >
              Now sing
            </p>
            <strong
              style={{
                display: "block",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                lineHeight: 0.96,
                color: "#ffffff",
                textShadow: "0 10px 26px rgba(0,0,0,0.38)",
              }}
            >
              {currentPhrase}
            </strong>
            <span
              style={{
                display: "block",
                marginTop: "0.3rem",
                fontSize: "1.02rem",
                color: "rgba(245, 250, 250, 0.82)",
                textShadow: "0 6px 16px rgba(0,0,0,0.32)",
              }}
            >
              {previewPhrase}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span
              style={{
                padding: "0.5rem 0.76rem",
                borderRadius: 999,
                background: "rgba(248, 252, 252, 0.84)",
                color: "#173641",
                fontWeight: 800,
              }}
            >
              Score {liveScore}
            </span>
            <span
              style={{
                padding: "0.5rem 0.76rem",
                borderRadius: 999,
                background: "rgba(248, 252, 252, 0.84)",
                color: "#173641",
                fontWeight: 800,
              }}
            >
              Streak {streak}
            </span>
            <span
              style={{
                padding: "0.5rem 0.76rem",
                borderRadius: 999,
                background: "rgba(248, 252, 252, 0.84)",
                color: guide.accent,
                fontWeight: 800,
              }}
            >
              {guide.headline}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: "0.5rem 0.82rem",
            borderRadius: 999,
            background: "rgba(248, 252, 252, 0.76)",
            color: "#173641",
            maxWidth: "fit-content",
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
          }}
        >
          <span style={{ fontWeight: 900 }}>{activeNote?.noteLabel ?? detectedNote ?? "--"}</span>
          <span style={{ opacity: 0.82 }}>
            {typeof targetCentsOff === "number"
              ? `${targetCentsOff > 0 ? "+" : ""}${targetCentsOff} cents vs target`
              : guide.detail}
          </span>
        </div>
      </div>
    </div>
  );
}
