import { PageSection } from "../../../components/ui/PageSection";
import { getLocalMedia, isVideoMedia } from "../../../shared/lib/local-media";
import type { PitchGuideNote } from "../../../shared/types/pitch-guide";
import type { Song } from "../../../shared/types/song";
import { env } from "../../../shared/config/env";
import { toYouTubeEmbedUrl } from "../../../shared/lib/youtube";
import { useEffect, useRef, useState } from "react";
import { PitchLaneOverlay } from "./PitchLaneOverlay";

type KaraokePlayerProps = {
  song?: Song | null;
  pitchGuide: PitchGuideNote[];
  pitchStatus: "idle" | "flat" | "onPitch" | "sharp" | "listening" | "noSignal" | "unsupported";
  detectedNote: string | null;
  frequency: number | null;
  centsOff: number | null;
  liveScore: number;
  streak: number;
};

function guideForSinger(
  pitchStatus: KaraokePlayerProps["pitchStatus"],
  centsOff: number | null,
  detectedNote: string | null,
) {
  const absCents = typeof centsOff === "number" ? Math.abs(centsOff) : null;

  switch (pitchStatus) {
    case "flat":
      return {
        headline: absCents !== null && absCents > 28 ? "Lift your pitch" : "A touch higher",
        detail: detectedNote
          ? `Your voice is landing under ${detectedNote}. Raise it gently until the orb reaches center.`
          : "Raise your pitch until the orb reaches the glowing center lane.",
        accent: "#fca5a5",
      };
    case "sharp":
      return {
        headline: absCents !== null && absCents > 28 ? "Bring it down" : "A touch lower",
        detail: detectedNote
          ? `You are slightly over ${detectedNote}. Relax and settle downward into the center.`
          : "Lower your pitch slightly until the orb falls back into the center lane.",
        accent: "#fdba74",
      };
    case "onPitch":
      return {
        headline: "Hold that note",
        detail: detectedNote
          ? `You are centered on ${detectedNote}. Stay steady and keep the streak alive.`
          : "You are centered. Sustain the note and protect the streak.",
        accent: "#86efac",
      };
    case "listening":
      return {
        headline: "Almost there",
        detail: "You are close. Smooth out the note and nudge the orb into the center glow.",
        accent: "#fde68a",
      };
    case "noSignal":
      return {
        headline: "Sing to wake the guide",
        detail: "Use one steady vowel like aaa or oo and the lane will start guiding you in real time.",
        accent: "#cbd5e1",
      };
    case "unsupported":
      return {
        headline: "Microphone unavailable",
        detail: "This browser or device is blocking live pitch feedback right now.",
        accent: "#fecaca",
      };
    default:
      return {
        headline: "Start the mic",
        detail: "Once the microphone is on, the stage will guide you higher, lower, or hold in real time.",
        accent: "#cbd5e1",
      };
  }
}

export function KaraokePlayer({
  song,
  pitchGuide,
  pitchStatus,
  detectedNote,
  frequency,
  centsOff,
  liveScore,
  streak,
}: KaraokePlayerProps) {
  const localMedia = song ? getLocalMedia(song.id) : null;
  const embedUrl = toYouTubeEmbedUrl(song?.youtubeKaraokeUrl);
  const persistentMediaUrl = song?.mediaUrl ? `${env.apiBaseUrl.replace(/\/api$/, "")}${song.mediaUrl}` : null;
  const playbackSource = persistentMediaUrl ?? localMedia?.objectUrl ?? null;
  const playbackLabel = song?.mediaUrl ? "Uploaded karaoke media" : localMedia ? "Local media from your PC" : null;
  const usesVideoFile = song?.mediaType ? song.mediaType.startsWith("video/") : isVideoMedia(localMedia);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const guide = guideForSinger(pitchStatus, centsOff, detectedNote);

  useEffect(() => {
    const handler = () => {
      setIsStageFullscreen(document.fullscreenElement === stageRef.current);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [playbackSource]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const syncPlaybackTime = () => {
    const media = mediaRef.current;
    if (!media) {
      return;
    }

    if (Number.isFinite(media.currentTime)) {
      setCurrentTime((previousTime) =>
        Math.abs(previousTime - media.currentTime) > 0.016 ? media.currentTime : previousTime,
      );
    }

    if (Number.isFinite(media.duration)) {
      setDuration(media.duration);
    }

    if (!media.paused && !media.ended) {
      frameRef.current = requestAnimationFrame(syncPlaybackTime);
    }
  };

  const startTracking = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(syncPlaybackTime);
  };

  const stopTracking = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    syncPlaybackTime();
  };

  const toggleStageFullscreen = async () => {
    if (!stageRef.current) {
      return;
    }

    if (document.fullscreenElement === stageRef.current) {
      await document.exitFullscreen();
      return;
    }

    await stageRef.current.requestFullscreen();
  };

  return (
    <PageSection
      title="Practice Stage"
      description="Each song now brings its own note map into the stage so the target lane can glide in time with playback instead of acting like a generic pitch meter."
    >
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {song ? (
          <div
            style={{
              padding: "1.25rem 1.35rem",
              borderRadius: 30,
              border: "1px solid rgba(194, 255, 225, 0.12)",
              background:
                "linear-gradient(135deg, rgba(7, 20, 22, 0.96), rgba(11, 31, 39, 0.92) 52%, rgba(28, 57, 44, 0.74))",
              boxShadow: "0 28px 60px rgba(0, 0, 0, 0.22)",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <p
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: "0.76rem",
                    color: "#fbbf24",
                  }}
                >
                  Song map ready
                </p>
                <h3 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 0.98 }}>{song.title}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1.04rem" }}>
                  {song.artist || "Unknown artist"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span
                  style={{
                    padding: "0.48rem 0.8rem",
                    borderRadius: 999,
                    background: "rgba(110, 231, 183, 0.12)",
                    border: "1px solid rgba(110, 231, 183, 0.18)",
                    fontWeight: 700,
                  }}
                >
                  Key {song.originalKey || "N/A"}
                </span>
                <span
                  style={{
                    padding: "0.48rem 0.8rem",
                    borderRadius: 999,
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.18)",
                    fontWeight: 700,
                  }}
                >
                  {song.bpm ? `${song.bpm} BPM` : "Tempo open"}
                </span>
                <span
                  style={{
                    padding: "0.48rem 0.8rem",
                    borderRadius: 999,
                    background: "rgba(251, 191, 36, 0.12)",
                    border: "1px solid rgba(251, 191, 36, 0.18)",
                    fontWeight: 700,
                  }}
                >
                  {pitchGuide.length > 0 ? `${pitchGuide.length} note targets` : "Preparing note targets"}
                </span>
                <span
                  style={{
                    padding: "0.48rem 0.8rem",
                    borderRadius: 999,
                    background: "rgba(45, 212, 191, 0.12)",
                    border: "1px solid rgba(45, 212, 191, 0.18)",
                    fontWeight: 700,
                  }}
                >
                  {playbackLabel ?? (embedUrl ? "YouTube reference" : "No source")}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong style={{ color: guide.accent, fontSize: "1.18rem" }}>{guide.headline}</strong>
              <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 820 }}>{guide.detail}</p>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0 }}>Loading song details...</p>
        )}

        {playbackSource ? (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                {song?.mediaUrl
                  ? "Using uploaded karaoke media with note timing anchored to this song."
                  : "Using local karaoke media from your PC with the live note lane on top."}
                {duration > 0 ? ` Current track length ${Math.round(duration)}s.` : ""}
              </p>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "0.42rem 0.8rem",
                    borderRadius: 999,
                    background: "rgba(34, 197, 94, 0.16)",
                    color: "#86efac",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                  }}
                >
                  Target lane active
                </span>
                <button
                  type="button"
                  onClick={toggleStageFullscreen}
                  style={{
                    padding: "0.55rem 0.85rem",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(15, 23, 42, 0.92)",
                    color: "#e2e8f0",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isStageFullscreen ? "Exit stage fullscreen" : "Fullscreen stage"}
                </button>
              </div>
            </div>
            {usesVideoFile ? (
              <div
                ref={stageRef}
                style={{
                  position: "relative",
                  borderRadius: 30,
                  overflow: "hidden",
                  background: "#000",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 28px 60px rgba(0, 0, 0, 0.34)",
                }}
              >
                <video
                  ref={(element) => {
                    mediaRef.current = element;
                  }}
                  src={playbackSource}
                  controls
                  onLoadedMetadata={syncPlaybackTime}
                  onPlay={startTracking}
                  onPause={stopTracking}
                  onSeeked={syncPlaybackTime}
                  onTimeUpdate={syncPlaybackTime}
                  onEnded={stopTracking}
                  style={{
                    width: "100%",
                    maxHeight: 580,
                    display: "block",
                    background: "#000",
                  }}
                />
                <PitchLaneOverlay
                  songTitle={song?.title}
                  artist={song?.artist}
                  pitchGuide={pitchGuide}
                  pitchStatus={pitchStatus}
                  currentTime={currentTime}
                  detectedNote={detectedNote}
                  frequency={frequency}
                  liveScore={liveScore}
                  streak={streak}
                />
              </div>
            ) : (
              <div
                ref={stageRef}
                style={{
                  borderRadius: 30,
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background:
                    "radial-gradient(circle at top, rgba(71, 135, 118, 0.34), rgba(7, 16, 26, 0.95) 58%, rgba(0, 0, 0, 0.98))",
                  boxShadow: "0 28px 60px rgba(0, 0, 0, 0.32)",
                }}
              >
                <div style={{ position: "relative", minHeight: 430 }}>
                  <PitchLaneOverlay
                    songTitle={song?.title}
                    artist={song?.artist}
                    pitchGuide={pitchGuide}
                    pitchStatus={pitchStatus}
                    currentTime={currentTime}
                    detectedNote={detectedNote}
                    frequency={frequency}
                    liveScore={liveScore}
                    streak={streak}
                  />
                </div>
                <div style={{ padding: "0 1.1rem 1.1rem" }}>
                  <audio
                    ref={(element) => {
                      mediaRef.current = element;
                    }}
                    src={playbackSource}
                    controls
                    onLoadedMetadata={syncPlaybackTime}
                    onPlay={startTracking}
                    onPause={stopTracking}
                    onSeeked={syncPlaybackTime}
                    onTimeUpdate={syncPlaybackTime}
                    onEnded={stopTracking}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : embedUrl ? (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <div
              style={{
                overflow: "hidden",
                borderRadius: 24,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
              }}
            >
              <iframe
                src={embedUrl}
                title={`${song?.title ?? "Karaoke"} YouTube video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: 420, border: "none", display: "block" }}
              />
            </div>
            <div
              style={{
                padding: "1rem 1.1rem",
                borderRadius: 22,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                background: "linear-gradient(180deg, rgba(55, 65, 81, 0.36), rgba(15, 23, 42, 0.88))",
              }}
            >
              <p style={{ margin: "0 0 0.45rem", fontSize: "1.05rem", fontWeight: 700 }}>YouTube playback is working as a reference.</p>
              <p style={{ margin: 0, opacity: 0.8, maxWidth: 760 }}>
                The note map for this song is ready, but the smooth target lane needs uploaded or local media so the app can read exact playback time.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "1rem 1.1rem",
              borderRadius: 22,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "linear-gradient(180deg, rgba(55, 65, 81, 0.36), rgba(15, 23, 42, 0.88))",
            }}
          >
            <p style={{ margin: "0 0 0.45rem", fontSize: "1.05rem", fontWeight: 700 }}>
              No playable media attached yet.
            </p>
            <p style={{ margin: 0, opacity: 0.8, maxWidth: 760 }}>
              The song can already have a note-map foundation, but the live target lane needs uploaded or local media so it can glide in sync with playback.
            </p>
          </div>
        )}
      </div>
    </PageSection>
  );
}
