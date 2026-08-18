"use client";

export default function Toasts({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast"
          style={{
            animation: "toastIn .25s ease both",
            borderColor: t.type === "error" ? "rgba(255,77,106,0.4)" : undefined,
            color: t.type === "error" ? "#ffc2cd" : undefined,
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
