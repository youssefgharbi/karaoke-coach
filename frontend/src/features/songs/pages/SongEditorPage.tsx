import { LyricsTimelineEditor } from "../../lyrics/components/LyricsTimelineEditor";
import { SongForm } from "../components/SongForm";

export function SongEditorPage() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <SongForm />
      <LyricsTimelineEditor />
    </div>
  );
}
