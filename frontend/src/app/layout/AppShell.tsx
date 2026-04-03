import type { PropsWithChildren } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthProvider";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/songs", label: "Songs" },
  { to: "/songs/new", label: "Add Song" },
];

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const { session, isAuthenticated, logout } = useAuth();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 12% 16%, rgba(110, 231, 183, 0.16), transparent 24%), radial-gradient(circle at 86% 18%, rgba(59, 130, 246, 0.18), transparent 22%), radial-gradient(circle at 52% 78%, rgba(251, 191, 36, 0.1), transparent 24%)",
        }}
      />
      <header
        style={{
          borderBottom: "1px solid var(--border-soft)",
          backdropFilter: "blur(14px)",
          background: "rgba(7, 15, 21, 0.6)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Link to="/" style={{ display: "grid", gap: "0.15rem" }}>
            <span style={{ fontWeight: 800, letterSpacing: "0.06em", fontSize: "1.05rem" }}>Karaoke Coach</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Modern vocal practice with a living stage feel
            </span>
          </Link>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {isAuthenticated && !isAuthRoute ? (
              <nav style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={({ isActive }) => ({
                      opacity: isActive ? 1 : 0.78,
                      fontWeight: isActive ? 700 : 500,
                      padding: "0.55rem 0.85rem",
                      borderRadius: 999,
                      background: isActive ? "rgba(110, 231, 183, 0.12)" : "transparent",
                      border: isActive ? "1px solid rgba(110, 231, 183, 0.18)" : "1px solid transparent",
                    })}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            ) : null}

            {session ? (
              <div style={{ display: "flex", gap: "0.7rem", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "0.55rem 0.9rem",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <strong>{session.displayName}</strong>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: "0.6rem 0.95rem",
                    borderRadius: 999,
                    border: "1px solid rgba(251, 191, 36, 0.28)",
                    background: "rgba(251, 191, 36, 0.12)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                <Link to="/login" style={{ opacity: 0.82, fontWeight: 700 }}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: "0.6rem 0.95rem",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, rgba(110, 231, 183, 0.18), rgba(56, 189, 248, 0.16))",
                    border: "1px solid rgba(110, 231, 183, 0.22)",
                    fontWeight: 700,
                  }}
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "2rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
