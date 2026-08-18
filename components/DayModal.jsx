"use client";
import { useState } from "react";
import { formatCurrency } from "@/lib/metrics";

const EMPTY_FORM = { pnl: "", symbol: "", notes: "" };

export default function DayModal({ date, trades, onClose, onAdd, onUpdate, onDelete, busy }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const total = trades.reduce((s, t) => s + Number(t.pnl), 0);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(trade) {
    setEditingId(trade.id);
    setForm({
      pnl: String(trade.pnl),
      symbol: trade.symbol || "",
      notes: trade.notes || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const pnl = Number(form.pnl);
    if (Number.isNaN(pnl)) return;
    const fields = {
      pnl,
      symbol: form.symbol.trim() || null,
      notes: form.notes.trim() || null,
    };
    if (editingId) {
      await onUpdate(editingId, fields);
    } else {
      await onAdd(fields);
    }
    cancelEdit();
  }

  const [y, m, d] = date.split("-");
  const label = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-CR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 style={{ textTransform: "capitalize" }}>{label}</h3>

        {trades.length > 0 && (
          <>
            <div className="day-summary">
              <div>
                <span className="day-summary-label">Total del día</span>
                <span className={`day-summary-value ${total > 0 ? "pos" : total < 0 ? "neg" : "neu"}`}>
                  {total >= 0 ? "+" : ""}{formatCurrency(total)}
                </span>
              </div>
              <div className="day-summary-breakdown">
                {trades.length} operación{trades.length === 1 ? "" : "es"}
              </div>
            </div>

            <div className="trade-list">
              {trades.map((t) => (
                <div key={t.id} className="trade-row">
                  <div className="trade-row-main">
                    <span className={`trade-pnl ${Number(t.pnl) > 0 ? "pos" : Number(t.pnl) < 0 ? "neg" : "neu"}`}>
                      {Number(t.pnl) >= 0 ? "+" : ""}{formatCurrency(t.pnl)}
                    </span>
                    {t.symbol && <span className="trade-symbol">{t.symbol}</span>}
                  </div>
                  {t.notes && <div className="trade-notes">{t.notes}</div>}
                  <div className="trade-actions">
                    <button type="button" className="link-btn" onClick={() => startEdit(t)}>Editar</button>
                    <button type="button" className="link-btn" onClick={() => onDelete(t.id)}>Borrar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-divider"><span>{editingId ? "Editar operación" : "Agregar operación"}</span></div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resultado (USD)</label>
            <input
              type="number"
              step="0.01"
              value={form.pnl}
              onChange={(e) => set("pnl", e.target.value)}
              placeholder="Ej. 250 o -120"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Par / instrumento (opcional)</label>
            <input value={form.symbol} onChange={(e) => set("symbol", e.target.value)} placeholder="Ej. EUR/USD, XAUUSD, NAS100" />
          </div>
          <div className="form-group">
            <label>Notas (opcional)</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="¿Qué pasó en esta operación?" />
          </div>
          <div className="modal-actions">
            {editingId && (
              <button type="button" className="btn-ghost" onClick={cancelEdit} style={{ marginRight: "auto" }}>
                Cancelar edición
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={onClose}>Cerrar</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {editingId ? "Guardar cambios" : "Agregar operación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
