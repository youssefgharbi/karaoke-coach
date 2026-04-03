import { PageSection } from "../../../components/ui/PageSection";
import type { PitchSessionSummary } from "../usePitchDetector";

type PitchMeterProps = {
  isListening: boolean;
  status: "idle" | "flat" | "onPitch" | "sharp" | "listening" | "noSignal" | "unsupported";
  note: string | null;
  frequency: number | null;
  centsOff: number | null;
  error: string | null;
  liveScore: number;
  streak: number;
  bestStreak: number;
  samples: number;
  targetKey?: string | null;
  lastSessionSummary: PitchSessionSummary | null;
  onStartListening: () => void;
  onStopListening: () => void;
};

function statusLabel(status: PitchMeterProps["status"]) {
  switch (status) {
    case "flat":
      return "A bit flat";
    case "sharp":
      return "A bit sharp";
    case "onPitch":
      return "On pitch";
    case "listening":
      return "Almost centered";
    case "noSignal":
      return "Sing or move closer to the mic";
    case "unsupported":
      return "Mic not supported";
    default:
      return "Mic off";
  }
}

function statusColor(status: PitchMeterProps["status"]) {
  switch (status) {
    case "flat":
    case "sharp":
      return "#fda4af";
    case "onPitch":
      return "#86efac";
    case "listening":
      return "#fde68a";
    case "noSignal":
      return "#cbd5e1";
    case "unsupported":
      return "#fca5a5";
    default:
      return "#cbd5e1";
  }
}

function guideMessage(status: PitchMeterProps["status"], centsOff: number | null) {
  const absolute = typeof centsOff === "number" ? Math.abs(centsOff) : null;

  switch (status) {
    case "flat":
      return {
        title: absolute !== null && absolute > 28 ? "Sing higher now" : "Tiny lift upward",
        body: "Push the note up until the orb returns to the glowing center target.",
      };
    case "sharp":
      return {
        title: absolute !== null && absolute > 28 ? "Ease lower now" : "Tiny drop downward",
        body: "Relax the note and let it settle back into the center lane.",
      };
    case "onPitch":
      return {
        title: "Stay right there",
        body: "You are centered. Keep the note smooth and protect your streak.",
      };
    case "listening":
      return {
        title: "Almost locked",
        body: "You are close. Smooth the note and nudge it into the center glow.",
      };
    case "noSignal":
      return {
        title: "Give me a clear note",
        body: "Sing one stable vowel like aaa or oo and hold it for a second.",
      };
    case "unsupported":
      return {
        title: "Microphone blocked",
        body: "Your browser is not giving the app usable mic input right now.",
      };
    default:
      return {
        title: "Start the pitch game",
        body: "Turn on the mic and the coach will guide you live while you sing.",
      };
  }
}

export function PitchMeter({
  isListening,
  status,
  note,
  frequency,
  centsOff,
  error,
  liveScore,
  streak,
  bestStreak,
  samples,
  targetKey,
  lastSessionSummary,
  onStartListening,
  onStopListening,
}: PitchMeterProps) {
  const guide = guideMessage(status, centsOff);

  return (
    <PageSection
      title="Session Coach"
      description="Mic control and session readout while the main stage follows the song note map in real time."
    >
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(300px, 0.85fr)",
        }}
      >
        <div
          style={{
            padding: "1.3rem",
            borderRadius: 26,
            border: "1px solid rgba(110, 231, 183, 0.12)",
            background:
              "linear-gradient(180deg, rgba(7, 22, 27, 0.96), rgba(7, 17, 23, 0.94) 55%, rgba(8, 18, 28, 0.92))",
          }}
        >
          <p
            style={{
              margin: "0 0 0.55rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.76rem",
              color: "#67e8f9",
            }}
          >
            Real-time instruction
          </p>
          <h3 style={{ margin: "0 0 0.35rem", color: statusColor(status), fontSize: "1.7rem", lineHeight: 1.02 }}>
            {guide.title}
          </h3>
          <p style={{ margin: "0 0 1rem", color: "var(--text-muted)", maxWidth: 620 }}>{guide.body}</p>
          <div
            style={{
              display: "grid",
              gap: "0.85rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.95rem",
                borderRadius: 20,
                background: "rgba(110, 231, 183, 0.08)",
                border: "1px solid rgba(110, 231, 183, 0.18)",
              }}
            >
              <p style={{ margin: "0 0 0.3rem", opacity: 0.72 }}>Live score</p>
              <strong style={{ fontSize: "1.8rem" }}>{liveScore}</strong>
            </div>
            <div
              style={{
                padding: "0.95rem",
                borderRadius: 20,
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.18)",
              }}
            >
              <p style={{ margin: "0 0 0.3rem", opacity: 0.72 }}>Current streak</p>
              <strong style={{ fontSize: "1.8rem" }}>{streak}</strong>
            </div>
            <div
              style={{
                padding: "0.95rem",
                borderRadius: 20,
                background: "rgba(251, 191, 36, 0.08)",
                border: "1px solid rgba(251, 191, 36, 0.18)",
              }}
            >
              <p style={{ margin: "0 0 0.3rem", opacity: 0.72 }}>Best streak</p>
              <strong style={{ fontSize: "1.8rem" }}>{bestStreak}</strong>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.45rem", marginTop: "1rem" }}>
            <strong style={{ color: statusColor(status), fontSize: "1.03rem" }}>{statusLabel(status)}</strong>
            <p style={{ margin: 0, opacity: 0.82 }}>
              {note ? `Detected note ${note}` : "Detected note will appear here"}
              {frequency ? ` | ${frequency} Hz` : ""}
              {typeof centsOff === "number" ? ` | ${centsOff > 0 ? "+" : ""}${centsOff} cents` : ""}
            </p>
            <p style={{ margin: 0, opacity: 0.72 }}>
              {targetKey ? `Current song key anchor: ${targetKey}` : "Add a song key to make pitch guidance more musical."}
              {samples > 0 ? ` | Samples: ${samples}` : ""}
            </p>
            {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}
          </div>
        </div>

        <div
          style={{
            padding: "1.2rem",
            borderRadius: 26,
            border: "1px solid var(--border-soft)",
            background: "linear-gradient(180deg, rgba(20, 83, 45, 0.22), rgba(8, 47, 73, 0.32))",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 0.4rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "0.76rem",
                color: "#86efac",
              }}
            >
              Session control
            </p>
            <strong style={{ fontSize: "1.15rem" }}>
              {isListening ? "Keep following the center lane" : "Start a guided singing round"}
            </strong>
            <p style={{ margin: "0.45rem 0 0", color: "var(--text-muted)" }}>
              The goal is simple: watch the moving note bars, respond instantly, and keep your note riding inside the target lane.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              style={{
                padding: "0.95rem 1rem",
                borderRadius: 16,
                border: "none",
                fontWeight: 800,
                background: isListening ? "#f87171" : "#34d399",
                color: isListening ? "#3f0b0b" : "#052e2b",
                cursor: "pointer",
              }}
            >
              {isListening ? "Stop microphone" : "Start microphone"}
            </button>

            <div
              style={{
                padding: "0.95rem",
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ margin: "0 0 0.45rem", fontWeight: 700 }}>Best way to use this stage</p>
              <ul style={{ margin: 0, paddingLeft: "1.05rem", display: "grid", gap: "0.42rem", opacity: 0.86 }}>
                <li>Use headphones so the mic hears you, not the karaoke track.</li>
                <li>Watch the moving note bars and singer orb more than the numbers.</li>
                <li>Sing one sustained vowel when the stage says higher or lower.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {lastSessionSummary ? (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.15rem",
            borderRadius: 24,
            border: "1px solid rgba(251, 191, 36, 0.18)",
            background: "linear-gradient(180deg, rgba(62, 38, 10, 0.26), rgba(20, 16, 8, 0.5))",
            display: "grid",
            gap: "0.85rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.76rem", color: "#fcd34d" }}>
                Final score
              </p>
              <h3 style={{ margin: 0, fontSize: "2.1rem" }}>{lastSessionSummary.score}</h3>
            </div>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <span style={{ padding: "0.45rem 0.75rem", borderRadius: 999, background: "rgba(110, 231, 183, 0.12)", border: "1px solid rgba(110, 231, 183, 0.2)" }}>
                Accuracy {lastSessionSummary.accuracy}%
              </span>
              <span style={{ padding: "0.45rem 0.75rem", borderRadius: 999, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                Best streak {lastSessionSummary.bestStreak}
              </span>
              <span style={{ padding: "0.45rem 0.75rem", borderRadius: 999, background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                Avg deviation {lastSessionSummary.averageCentsOff ?? "-"} cents
              </span>
            </div>
          </div>
          <p style={{ margin: 0, opacity: 0.78 }}>
            On-pitch moments: {lastSessionSummary.onPitchMoments} | Flat: {lastSessionSummary.flatMoments} | Sharp:{" "}
            {lastSessionSummary.sharpMoments}
          </p>
        </div>
      ) : null}
    </PageSection>
  );
}
