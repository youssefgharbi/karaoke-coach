import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

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

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticate, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      authenticate(response);
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <PageSection
        title="Return to your rehearsal space"
        description="Log in to reopen your vocal workspace, tracked scores, and uploaded karaoke media."
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
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
              background: "linear-gradient(135deg, #6ee7b7, #38bdf8)",
              color: "#052017",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </PageSection>

      <PageSection
        title="What unlocks after login"
        description="This is the beginning of the real member experience rather than a public demo shell."
      >
        <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.75rem", color: "var(--text-muted)" }}>
          <li>Your stage session and score flow stay tied to your account.</li>
          <li>Uploaded karaoke media remains part of your own practice library.</li>
          <li>Future melody maps and session history will sit on top of this identity layer.</li>
        </ul>
        <p style={{ marginTop: "1.1rem", marginBottom: 0 }}>
          New here?{" "}
          <Link to="/register" style={{ fontWeight: 700, color: "var(--accent-warm)" }}>
            Create your account
          </Link>
        </p>
      </PageSection>
    </div>
  );
}
