"use client";

export default function EmptyState({ onNew }) {
  return (
    <div className="empty-state">
      <div className="big-icon">📈</div>
      <h2>Creá tu primera cuenta</h2>
      <p>
        Registrá cuentas de challenge, fondeo, real, live o futuros. Definí las reglas de cada una
        y llevá el control diario de ganancias y pérdidas en un solo lugar.
      </p>
      <button className="btn-primary" onClick={onNew}>+ Nueva cuenta</button>
    </div>
  );
}
