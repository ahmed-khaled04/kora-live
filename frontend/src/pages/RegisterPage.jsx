import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, Field, AuthInput, SubmitBtn } from "./LoginPage";

export default function RegisterPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await register(form.email, form.username, form.password);
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
