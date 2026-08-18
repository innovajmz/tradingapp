"use client";

export default function EmptyState({ onNew }) {
  return (
    <div className="empty-state">
      <svg className="big-icon" viewBox="0 0 20 20" width="40" height="40">
        <line x1="5" y1="3" x2="5" y2="9" stroke="#33d69f" strokeWidth="1.6" />
        <rect x="3" y="6" width="4" height="6" rx="1" fill="#33d69f" />
        <line x1="15" y1="8" x2="15" y2="17" stroke="#ff5470" strokeWidth="1.6" />
        <rect x="13" y="10" width="4" height="6" rx="1" fill="#ff5470" />
      </svg>
      <h2>Creá tu primera cuenta</h2>
      <p>
        Registrá cuentas de challenge, fondeo, real, live o futuros. Definí las reglas de cada una
        y llevá el control diario de ganancias y pérdidas en un solo lugar.
      </p>
      <button className="btn-primary" onClick={onNew}>+ Nueva cuenta</button>
    </div>
  );
}
