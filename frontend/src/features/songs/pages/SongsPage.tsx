import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { PageSection } from "../../../components/ui/PageSection";
import { apiRequest } from "../../../shared/api/client";
import type { Song } from "../../../shared/types/song";

export function SongsPage() {
  const location = useLocation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSongs() {
      try {
        setIsLoading(true);
        const response = await apiRequest<Song[]>("/songs");
        if (isMounted) {
          setSongs(response);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load songs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSongs();

    return () => {
      isMounted = false;
    };
  }, []);

  const createdSongTitle = location.state?.createdSongTitle as string | undefined;

  const sortedSongs = [...songs].sort((left, right) => right.id - left.id);

  return (
    <PageSection title="Song library" description="This page will list the user songs stored in the backend.">
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
          <p style={{ margin: 0, opacity: 0.8 }}>Your first saved songs will appear here.</p>
          <Link to="/songs/new" style={{ fontWeight: 700 }}>
            Create song
          </Link>
        </div>

        {createdSongTitle ? (
          <p style={{ margin: 0, color: "#86efac" }}>Saved "{createdSongTitle}" successfully.</p>
        ) : null}

        {isLoading ? <p style={{ margin: 0 }}>Loading songs...</p> : null}
        {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}

        {!isLoading && !error && songs.length === 0 ? (
          <div style={{ padding: "1rem", borderRadius: 16, background: "rgba(11, 18, 32, 0.45)" }}>
            <p style={{ margin: 0 }}>No songs yet. Create your first one and we’ll use it for lyrics and practice mode.</p>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: "1rem" }}>
          {sortedSongs.map((song) => (
            <article
              key={song.id}
              style={{
                padding: "1rem",
                borderRadius: 16,
                border: "1px solid rgba(235, 242, 255, 0.12)",
                background: "rgba(11, 18, 32, 0.45)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {song.coverImageUrl ? (
                    <img
                      src={song.coverImageUrl}
                      alt={`${song.title} cover`}
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid rgba(235, 242, 255, 0.12)",
                      }}
                    />
                  ) : null}
                  <div>
                    <h3 style={{ margin: "0 0 0.4rem" }}>{song.title}</h3>
                    <p style={{ margin: "0 0 0.35rem", opacity: 0.75 }}>
                      {song.artist || "Unknown artist"} | Key {song.originalKey || "N/A"}
                      {song.bpm ? ` | ${song.bpm} BPM` : ""}
                    </p>
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      {song.mediaUrl ? (
                        <span
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: 999,
                            background: "rgba(34, 197, 94, 0.16)",
                            color: "#86efac",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {song.mediaType?.startsWith("video/") ? "Uploaded video ready" : "Uploaded audio ready"}
                        </span>
                      ) : null}
                      {song.youtubeKaraokeUrl ? (
                        <span
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: 999,
                            background: "rgba(59, 130, 246, 0.16)",
                            color: "#93c5fd",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          YouTube fallback
                        </span>
                      ) : null}
                      {!song.mediaUrl && !song.youtubeKaraokeUrl ? (
                        <span
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: 999,
                            background: "rgba(148, 163, 184, 0.16)",
                            color: "#cbd5e1",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          No playback source yet
                        </span>
                      ) : null}
                    </div>
                    {song.spotifyTrackId ? (
                      <p style={{ margin: 0, opacity: 0.65, fontSize: "0.92rem" }}>
                        Spotify track ID: {song.spotifyTrackId}
                      </p>
                    ) : null}
                    {song.youtubeKaraokeUrl ? (
                      <a
                        href={song.youtubeKaraokeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-block", marginTop: "0.45rem", opacity: 0.8 }}
                      >
                        Open karaoke video
                      </a>
                    ) : null}
                  </div>
                </div>
                <Link to={`/practice/${song.id}`} style={{ fontWeight: 700 }}>
                  Open practice
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
