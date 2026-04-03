import type { PropsWithChildren } from "react";

type PageSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section
      style={{
        padding: "1.6rem",
        border: "1px solid var(--border-soft)",
        borderRadius: 28,
        background:
          "linear-gradient(180deg, rgba(8, 18, 28, 0.9), rgba(13, 28, 35, 0.84) 46%, rgba(8, 17, 23, 0.92))",
        boxShadow: "0 28px 64px rgba(0, 0, 0, 0.24)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(110, 231, 183, 0.09), transparent 28%), radial-gradient(circle at left bottom, rgba(251, 191, 36, 0.08), transparent 32%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.45rem", position: "relative", zIndex: 1 }}>{title}</h2>
        {description ? (
          <p style={{ opacity: 0.8, maxWidth: 760, position: "relative", zIndex: 1 }}>{description}</p>
        ) : null}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}
