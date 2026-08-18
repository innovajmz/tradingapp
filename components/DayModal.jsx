"use client";
import { useState } from "react";

export default function DayModal({ date, entry, onClose, onSave, onDelete, busy }) {
  const [pnl, setPnl] = useState(entry ? String(entry.pnl) : "");
  const [notes, setNotes] = useState(entry?.notes || "");

  function handleSubmit(e) {
    e.preventDefault();
    const value = Number(pnl);
    if (Number.isNaN(value)) return;
    onSave(value, notes.trim() || null);
  }

  const [y, m, d] = date.split("-");
  const label = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-CR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 style={{ textTransform: "capitalize" }}>{label}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resultado del día (USD)</label>
            <input
              type="number"
              step="0.01"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="Ej. 250 o -120"
              autoFocus
              required
            />
            <div className="field-hint">Usá negativo para pérdidas, ej. -120.50</div>
          </div>
          <div className="form-group">
            <label>Notas (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Qué pasó hoy?" />
          </div>
          <div className="modal-actions">
            {entry && (
              <button type="button" className="btn-ghost danger" onClick={() => onDelete(entry.id)} style={{ marginRight: "auto" }}>
                Borrar
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={busy}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
