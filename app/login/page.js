"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(traducirError(error.message));
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(traducirError(error.message));
      setMessage("Cuenta creada. Revisá tu correo para confirmar el registro y luego iniciá sesión.");
      setMode("signin");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M3 17l5-5 4 4 8-9" stroke="url(#g)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0" stopColor="#7c5cff" />
                <stop offset="1" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 17 }}>
            Trading<span className="accent-text">Calendar</span>
          </span>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
          >
            Crear cuenta
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@correo.com"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Un momento..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

function traducirError(msg) {
  if (/invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/already registered/i.test(msg)) return "Ese correo ya tiene una cuenta creada.";
  if (/password.*at least/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  return msg;
}
