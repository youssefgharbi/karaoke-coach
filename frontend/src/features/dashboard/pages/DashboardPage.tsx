import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PageSection } from "../../../components/ui/PageSection";
import { useAuth } from "../../auth/AuthProvider";
import { apiRequest } from "../../../shared/api/client";
import type { Song } from "../../../shared/types/song";

type DashboardStats = {
  songCount: number;
  sessionCount: number;
  averagePitchScore: number;
};

export function DashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [statsResponse, songsResponse] = await Promise.all([
          apiRequest<DashboardStats>("/stats/dashboard"),
          apiRequest<Song[]>("/songs"),
        ]);

        if (!isMounted) {
          return;
        }

        setStats(statsResponse);
        setSongs([...songsResponse].sort((left, right) => right.id - left.id).slice(0, 3));
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section
        style={{
          padding: "2rem",
          borderRadius: 32,
          background:
            "linear-gradient(135deg, rgba(7, 21, 26, 0.9), rgba(16, 38, 48, 0.84) 55%, rgba(34, 84, 61, 0.68))",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 28px 64px rgba(0, 0, 0, 0.24)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(110, 231, 183, 0.18), transparent 28%), radial-gradient(circle at 85% 16%, rgba(56, 189, 248, 0.14), transparent 24%), radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.14), transparent 30%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "1rem" }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem", color: "var(--accent-warm)" }}>
            Vocal garden
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 0.96 }}>
            Welcome back, {session?.displayName ?? "Singer"}.
          </h1>
          <p style={{ margin: 0, maxWidth: 720, color: "var(--text-muted)", fontSize: "1.06rem" }}>
            This studio is where technology, vocal discipline, and something a little more human meet: your songs,
            your playback sources, your score history, and the coaching loop we’re building around them.
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            <Link to="/songs/new" style={{ fontWeight: 800, padding: "0.8rem 1rem", borderRadius: 999, background: "rgba(110, 231, 183, 0.14)", border: "1px solid rgba(110, 231, 183, 0.26)" }}>
              Add a new karaoke source
            </Link>
            <Link to="/songs" style={{ fontWeight: 800, padding: "0.8rem 1rem", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-soft)" }}>
              Open song library
            </Link>
          </div>
        </div>
      </section>

      <PageSection
        title="Your singing workspace"
        description="A quick view of your songs, sessions, and how your practice rhythm is growing."
      >
        {error ? <p style={{ marginTop: 0, color: "#fca5a5" }}>{error}</p> : null}
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(14, 116, 144, 0.22), rgba(15, 23, 42, 0.82))",
              border: "1px solid rgba(103, 232, 249, 0.12)",
            }}
          >
            <p style={{ margin: "0 0 0.35rem", opacity: 0.7 }}>Songs</p>
            <strong style={{ fontSize: "1.8rem" }}>{stats?.songCount ?? "-"}</strong>
          </div>
          <div
            style={{
              padding: "1rem",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(22, 101, 52, 0.22), rgba(15, 23, 42, 0.82))",
              border: "1px solid rgba(134, 239, 172, 0.12)",
            }}
          >
            <p style={{ margin: "0 0 0.35rem", opacity: 0.7 }}>Sessions</p>
            <strong style={{ fontSize: "1.8rem" }}>{stats?.sessionCount ?? "-"}</strong>
          </div>
          <div
            style={{
              padding: "1rem",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(161, 98, 7, 0.22), rgba(15, 23, 42, 0.82))",
              border: "1px solid rgba(253, 224, 71, 0.12)",
            }}
          >
            <p style={{ margin: "0 0 0.35rem", opacity: 0.7 }}>Avg pitch score</p>
            <strong style={{ fontSize: "1.8rem" }}>
              {stats ? `${Math.round(stats.averagePitchScore)}%` : "-"}
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <Link to="/songs/new" style={{ fontWeight: 700, color: "var(--accent-fresh)" }}>
            Add song
          </Link>
          <Link to="/songs" style={{ fontWeight: 700, color: "var(--accent-cool)" }}>
            Open library
          </Link>
        </div>

        <div style={{ display: "grid", gap: "0.85rem" }}>
          <p style={{ margin: 0, opacity: 0.82 }}>Recent songs</p>
          {songs.length === 0 ? (
            <p style={{ margin: 0 }}>No songs yet. Add your first one to start practice.</p>
          ) : (
            [...songs].sort((left, right) => right.id - left.id).map((song) => (
              <div
                key={song.id}
                style={{
                  padding: "0.95rem 1rem",
                  borderRadius: 16,
                  background: "rgba(11, 18, 32, 0.48)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{song.title}</strong>
                  <p style={{ margin: "0.2rem 0 0", opacity: 0.72 }}>
                    {song.artist || "Unknown artist"} | Key {song.originalKey || "N/A"}
                  </p>
                </div>
                <Link to={`/practice/${song.id}`} style={{ fontWeight: 700, color: "var(--accent-warm)" }}>
                  Practice
                </Link>
              </div>
            ))
          )}
        </div>
      </PageSection>
    </div>
  );
}
