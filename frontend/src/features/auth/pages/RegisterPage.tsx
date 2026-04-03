import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { PageSection } from "../../../components/ui/PageSection";
import { apiRequest } from "../../../shared/api/client";
import type { AuthResponse } from "../../../shared/types/auth";
import { useAuth } from "../AuthProvider";

const fieldStyle = {
  width: "100%",
  padding: "0.9rem 1rem",
  borderRadius: 16,
  border: "1px solid var(--border-soft)",
  background: "rgba(5, 16, 19, 0.58)",
  color: "var(--text-primary)",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { authenticate, isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          displayName,
          email,
          password,
        }),
      });

      authenticate(response);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <PageSection
        title="Create your vocal studio account"
        description="Start a personal practice space where your scores, songs, and rehearsal rhythm can grow together."
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>Display name</span>
            <input
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="How you want to appear in the app"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              style={fieldStyle}
            />
          </label>

          {error ? <p style={{ margin: 0, color: "#fecaca" }}>{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.95rem 1.1rem",
              borderRadius: 16,
              border: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #fbbf24, #6ee7b7)",
              color: "#17210d",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </PageSection>

      <PageSection
        title="What this account becomes"
        description="This identity layer is what lets the app grow into real coaching instead of a disconnected tool."
      >
        <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.75rem", color: "var(--text-muted)" }}>
          <li>Personal practice history and better end-of-session scoring.</li>
          <li>Saved karaoke sources, melody maps, and future lyric-note alignment.</li>
          <li>A cleaner portfolio story because the app now behaves like a product.</li>
        </ul>
        <p style={{ marginTop: "1.1rem", marginBottom: 0 }}>
          Already registered?{" "}
          <Link to="/login" style={{ fontWeight: 700, color: "var(--accent-cool)" }}>
            Log in here
          </Link>
        </p>
      </PageSection>
    </div>
  );
}
