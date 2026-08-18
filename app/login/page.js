"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmFailed = searchParams.get("error") === "confirm_failed";
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
      setMessage("Cuenta creada. Revisá tu correo y hacé clic en el enlace para activarla — vas a quedar con la sesión iniciada.");
      setMode("signin");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 20 20" width="22" height="22">
            <line x1="5" y1="3" x2="5" y2="9" stroke="#33d69f" strokeWidth="1.6" />
            <rect x="3" y="6" width="4" height="6" rx="1" fill="#33d69f" />
            <line x1="15" y1="8" x2="15" y2="17" stroke="#ff5470" strokeWidth="1.6" />
            <rect x="13" y="10" width="4" height="6" rx="1" fill="#ff5470" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 17 }}>
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

        {(error || confirmFailed) && (
          <div className="auth-error">
            {error || "El enlace de confirmación ya venció o no es válido. Iniciá sesión o creá la cuenta de nuevo."}
          </div>
        )}
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
