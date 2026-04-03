import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageSection } from "../../../components/ui/PageSection";
import { apiRequest } from "../../../shared/api/client";
import type { Song, SongPayload } from "../../../shared/types/song";

type MediaUploadResponse = {
  mediaUrl: string;
  mediaType: string;
  originalFileName: string;
};

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const fieldStyle = {
  width: "100%",
  padding: "0.85rem 0.95rem",
  borderRadius: 12,
  border: "1px solid rgba(235, 242, 255, 0.18)",
  background: "rgba(11, 18, 32, 0.75)",
  color: "#ebf2ff",
};

const labelStyle = {
  display: "grid",
  gap: "0.5rem",
};

export function SongForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SongPayload>({
    title: "",
    artist: "",
    originalKey: "C",
    bpm: undefined,
    audioUrl: "",
    coverImageUrl: "",
    spotifyTrackId: "",
    youtubeKaraokeUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMediaFile, setLocalMediaFile] = useState<File | null>(null);

  const updateField = <K extends keyof SongPayload>(key: K, value: SongPayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const payload: SongPayload = {
        title: form.title.trim(),
        artist: form.artist?.trim() || undefined,
        originalKey: form.originalKey?.trim() || undefined,
        bpm: form.bpm || undefined,
        audioUrl: form.audioUrl?.trim() || undefined,
        coverImageUrl: form.coverImageUrl?.trim() || undefined,
        spotifyTrackId: form.spotifyTrackId?.trim() || undefined,
        youtubeKaraokeUrl: form.youtubeKaraokeUrl?.trim() || undefined,
      };

      if (localMediaFile) {
        const formData = new FormData();
        formData.append("file", localMediaFile);

        const uploadedMedia = await apiRequest<MediaUploadResponse>("/media/upload", {
          method: "POST",
          body: formData,
        });

        payload.mediaUrl = uploadedMedia.mediaUrl;
        payload.mediaType = uploadedMedia.mediaType;
      }

      const createdSong = await apiRequest<Song>("/songs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      navigate("/songs", {
        state: {
          createdSongTitle: createdSong.title,
        },
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save the song.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageSection title="Song details" description="Create a karaoke practice song with the metadata we need first.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div
          style={{
            padding: "1rem",
            borderRadius: 16,
            background: "rgba(52, 211, 153, 0.08)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
          }}
        >
          <p style={{ margin: "0 0 0.35rem", fontWeight: 700 }}>Spotify-ready metadata</p>
          <p style={{ margin: 0, opacity: 0.8 }}>
            For now you can paste Spotify track IDs and cover art manually. Next we’ll add real Spotify search and
            auto-fill.
          </p>
        </div>

        <label style={labelStyle}>
          <span>Title</span>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Example: My Way"
            style={fieldStyle}
          />
        </label>

        <label style={labelStyle}>
          <span>Artist</span>
          <input
            value={form.artist}
            onChange={(event) => updateField("artist", event.target.value)}
            placeholder="Example: Frank Sinatra"
            style={fieldStyle}
          />
        </label>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label style={labelStyle}>
            <span>Original key</span>
            <select
              value={form.originalKey}
              onChange={(event) => updateField("originalKey", event.target.value)}
              style={fieldStyle}
            >
              {keys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>BPM</span>
            <input
              type="number"
              min={1}
              value={form.bpm ?? ""}
              onChange={(event) =>
                updateField("bpm", event.target.value ? Number(event.target.value) : undefined)
              }
              placeholder="Optional tempo"
              style={fieldStyle}
            />
          </label>
        </div>

        <label style={labelStyle}>
          <span>Local karaoke media</span>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(event) => setLocalMediaFile(event.target.files?.[0] ?? null)}
            style={fieldStyle}
          />
          <span style={{ opacity: 0.7, fontSize: "0.92rem" }}>
            Best for reliable karaoke playback. This is now uploaded to the backend so it remains available after refresh.
          </span>
          {localMediaFile ? (
            <span style={{ opacity: 0.8, fontSize: "0.92rem" }}>Selected: {localMediaFile.name}</span>
          ) : null}
        </label>

        <label style={labelStyle}>
          <span>Audio URL</span>
          <input
            type="url"
            value={form.audioUrl}
            onChange={(event) => updateField("audioUrl", event.target.value)}
            placeholder="https://example.com/audio.mp3"
            style={fieldStyle}
          />
        </label>

        <label style={labelStyle}>
          <span>YouTube karaoke URL</span>
          <input
            type="url"
            value={form.youtubeKaraokeUrl}
            onChange={(event) => updateField("youtubeKaraokeUrl", event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={fieldStyle}
          />
        </label>

        <label style={labelStyle}>
          <span>Cover image URL</span>
          <input
            type="url"
            value={form.coverImageUrl}
            onChange={(event) => updateField("coverImageUrl", event.target.value)}
            placeholder="https://image-cdn.example/cover.jpg"
            style={fieldStyle}
          />
        </label>

        <label style={labelStyle}>
          <span>Spotify track ID</span>
          <input
            value={form.spotifyTrackId}
            onChange={(event) => updateField("spotifyTrackId", event.target.value)}
            placeholder="Optional for future Spotify lookup"
            style={fieldStyle}
          />
        </label>

        {error ? <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p> : null}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: "0.85rem 1.2rem",
              borderRadius: 12,
              border: "none",
              fontWeight: 700,
              background: "#34d399",
              color: "#052e2b",
              cursor: "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save song"}
          </button>
        </div>
      </form>
    </PageSection>
  );
}
