import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(form.email, form.password);
      await authLogin(token);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email">
          <AuthInput
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={loading}
          />
        </Field>

        <Field label="Password">
          <AuthInput
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
          />
        </Field>

        {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}

        <SubmitBtn loading={loading}>{loading ? "Signing in..." : "Sign In"}</SubmitBtn>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--app-muted)", marginTop: 24 }}>
        No account?{" "}
        <Link to="/register" style={{ color: "var(--app-green)", textDecoration: "none", fontWeight: 600 }}>
          Register
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "background 0.3s",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderRadius: 16,
          padding: "40px 36px",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--app-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ⚽
            </div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                color: "var(--app-text)",
              }}
            >
              KORA
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--app-muted)" }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--app-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

export function AuthInput({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        background: "var(--app-surface2)",
        border: `1px solid ${focused ? "#16a34a55" : "var(--app-border)"}`,
        borderRadius: 8,
        color: "var(--app-text)",
        fontSize: 13,
        padding: "10px 12px",
        outline: "none",
        width: "100%",
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "border-color 0.2s, background 0.3s",
        opacity: props.disabled ? 0.6 : 1,
      }}
    />
  );
}

export function SubmitBtn({ children, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--app-green)",
        border: "none",
        borderRadius: 8,
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        padding: "11px 0",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'Space Grotesk', sans-serif",
        filter: hovered && !loading ? "brightness(1.12)" : "none",
        transition: "filter 0.2s",
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 4px 20px #16a34a33",
      }}
    >
      {children}
    </button>
  );
}
