import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { apiRequest } from "../../../shared/api/client";
import type { Song } from "../../../shared/types/song";
import type { PitchGuideNote } from "../../../shared/types/pitch-guide";
import { KaraokePlayer } from "../components/KaraokePlayer";
import { PitchMeter } from "../components/PitchMeter";
import { usePitchDetector } from "../usePitchDetector";
import type { PracticeSessionResponse } from "../../../shared/types/practice-session";

export function KaraokeSessionPage() {
  const { songId } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [pitchGuide, setPitchGuide] = useState<PitchGuideNote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(null);
  const completedSummaryRef = useRef<number | null>(null);
  const pitch = usePitchDetector();

  useEffect(() => {
    let isMounted = true;

    async function loadSongData() {
      if (!songId) {
        setError("Missing song id.");
        return;
      }

      try {
        const [songResponse, pitchGuideResponse] = await Promise.all([
          apiRequest<Song>(`/songs/${songId}`),
          apiRequest<PitchGuideNote[]>(`/songs/${songId}/pitch-guide`),
        ]);

        if (isMounted) {
          setSong(songResponse);
          setPitchGuide(pitchGuideResponse);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load song.");
        }
      }
    }

    loadSongData();

    return () => {
      isMounted = false;
    };
  }, [songId]);

  useEffect(() => {
    let isMounted = true;

    async function startPracticeSession() {
      if (!pitch.isListening || practiceSessionId || !songId) {
        return;
      }

      try {
        const response = await apiRequest<PracticeSessionResponse>("/sessions", {
          method: "POST",
          body: JSON.stringify({
            songId: Number(songId),
            transposeSemitones: 0,
          }),
        });

        if (isMounted) {
          setPracticeSessionId(response.id);
        }
      } catch {
        if (isMounted) {
          setError("Practice session started locally, but saving the final score may fail until the backend is available.");
        }
      }
    }

    startPracticeSession();

    return () => {
      isMounted = false;
    };
  }, [pitch.isListening, practiceSessionId, songId]);

  useEffect(() => {
    let isMounted = true;

    async function completePracticeSession() {
      if (
        pitch.isListening ||
        !pitch.lastSessionSummary ||
        !practiceSessionId ||
        completedSummaryRef.current === pitch.lastSessionSummary.endedAt
      ) {
        return;
      }

      try {
        await apiRequest<PracticeSessionResponse>(`/sessions/${practiceSessionId}/complete`, {
          method: "POST",
          body: JSON.stringify({
            averagePitchScore: pitch.lastSessionSummary.score,
            flatMoments: pitch.lastSessionSummary.flatMoments,
            sharpMoments: pitch.lastSessionSummary.sharpMoments,
            notes: `Best streak ${pitch.lastSessionSummary.bestStreak} | Accuracy ${pitch.lastSessionSummary.accuracy}%`,
          }),
        });

        if (isMounted) {
          completedSummaryRef.current = pitch.lastSessionSummary.endedAt;
          setPracticeSessionId(null);
        }
      } catch {
        if (isMounted) {
          setError("Your score was calculated, but the backend could not save the finished session.");
        }
      }
    }

    completePracticeSession();

    return () => {
      isMounted = false;
    };
  }, [pitch.isListening, pitch.lastSessionSummary, practiceSessionId]);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}
      <KaraokePlayer
        song={song}
        pitchGuide={pitchGuide}
        pitchStatus={pitch.status}
        detectedNote={pitch.note}
        frequency={pitch.frequency}
        centsOff={pitch.centsOff}
        liveScore={pitch.liveScore}
        streak={pitch.streak}
      />
      <PitchMeter
        isListening={pitch.isListening}
        status={pitch.status}
        note={pitch.note}
        frequency={pitch.frequency}
        centsOff={pitch.centsOff}
        error={pitch.error}
        liveScore={pitch.liveScore}
        streak={pitch.streak}
        bestStreak={pitch.bestStreak}
        samples={pitch.samples}
        targetKey={song?.originalKey}
        lastSessionSummary={pitch.lastSessionSummary}
        onStartListening={pitch.startListening}
        onStopListening={pitch.stopListening}
      />
    </div>
  );
}
