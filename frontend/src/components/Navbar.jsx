import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Trophy, Home, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

function useDarkMode() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };
  return [dark, toggle];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [dark, toggleDark] = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 60,
        background: "var(--app-nav-bg)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--app-border)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link
            to="/feed"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "var(--app-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ⚽
            </div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 2,
                color: "var(--app-text)",
              }}
            >
              KORA
            </span>
          </Link>

          <nav style={{ display: "flex", gap: 4 }}>
            <NavLink to="/feed" icon={<Home size={14} />} label="Feed" />
            <NavLink to="/leaderboard" icon={<Trophy size={14} />} label="Leaderboard" />
          </nav>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Dark mode toggle */}
          <IconBtn
            onClick={toggleDark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </IconBtn>

          {/* Notification bell */}
          <Link to="/notifications" style={{ position: "relative", display: "flex" }}>
            <IconBtn>
              <Bell size={16} />
            </IconBtn>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: "50%",
                  height: 16,
                  width: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User avatar */}
          <Link to={`/users/${user?.id}`} style={{ textDecoration: "none" }}>
            <GhostBtn>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#16a34a22",
                  border: "1px solid #16a34a55",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--app-green)",
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: "var(--app-muted)" }}>
                {user?.username}
              </span>
            </GhostBtn>
          </Link>

          {/* Logout */}
          <IconBtn onClick={handleLogout} title="Sign out">
            <LogOut size={15} />
          </IconBtn>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        color: hovered ? "var(--app-text)" : "var(--app-muted)",
        background: hovered ? "var(--app-surface2)" : "transparent",
        textDecoration: "none",
        transition: "color 0.2s, background 0.2s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
    </Link>
  );
}

function GhostBtn({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        borderRadius: 6,
        background: hovered ? "var(--app-surface2)" : "transparent",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function IconBtn({ children, onClick, title }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 6,
        background: hovered ? "var(--app-surface2)" : "transparent",
        border: "none",
        cursor: "pointer",
        color: hovered ? "var(--app-text)" : "var(--app-muted)",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
