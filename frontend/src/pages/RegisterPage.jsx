import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, Field, AuthInput, SubmitBtn } from "./LoginPage";

export default function RegisterPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await register(form.email, form.username, form.password, avatarFile);
      await authLogin(token);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Create your account">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Avatar picker */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2px dashed var(--app-muted)",
              background: "var(--app-surface)",
              cursor: "pointer",
              overflow: "hidden",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 28 }}>📷</span>
            )}
          </button>
          <span style={{ fontSize: 12, color: "var(--app-muted)" }}>
            {avatarPreview ? "Click to change" : "Add photo (optional)"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

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

        <Field label="Username">
          <AuthInput
            placeholder="4–12 characters"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            minLength={4}
            maxLength={12}
            required
            disabled={loading}
          />
        </Field>

        <Field label="Password">
          <AuthInput
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
            disabled={loading}
          />
        </Field>

        {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}

        <SubmitBtn loading={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </SubmitBtn>
      </form>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--app-muted)", marginTop: 24 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--app-green)", textDecoration: "none", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
