"use client";
import { useState } from "react";
import { ACCOUNT_TYPES, ACCOUNT_STATUS } from "@/lib/metrics";
import PillSelect from "@/components/PillSelect";

const DAILY_LOSS_TYPES = [
  { value: "static", label: "Estático" },
  { value: "dynamic", label: "Dinámico" },
];
const DRAWDOWN_TYPES = [
  { value: "static", label: "Estático" },
  { value: "trailing", label: "Trailing" },
];

export default function AccountModal({ account, onClose, onSave, busy }) {
  const isEdit = !!account;
  const [form, setForm] = useState({
    name: account?.name || "",
    type: account?.type || "challenge",
    prop_firm: account?.prop_firm || "",
    starting_balance: account?.starting_balance ?? 10000,
    total_commission: account?.total_commission ?? "",
    profit_split: account?.profit_split ?? "",
    profit_target_pct: account?.profit_target_pct ?? "",
    max_daily_loss_pct: account?.max_daily_loss_pct ?? "",
    daily_loss_type: account?.daily_loss_type || "static",
    max_total_drawdown_pct: account?.max_total_drawdown_pct ?? "",
    drawdown_type: account?.drawdown_type || "static",
    min_trading_days: account?.min_trading_days ?? "",
    status: account?.status || "active",
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      type: form.type,
      prop_firm: form.prop_firm.trim() || null,
      starting_balance: Number(form.starting_balance) || 0,
      total_commission: form.total_commission === "" ? 0 : Number(form.total_commission),
      profit_split: form.profit_split === "" ? null : Number(form.profit_split),
      profit_target_pct: form.profit_target_pct === "" ? null : Number(form.profit_target_pct),
      max_daily_loss_pct: form.max_daily_loss_pct === "" ? null : Number(form.max_daily_loss_pct),
      daily_loss_type: form.daily_loss_type,
      max_total_drawdown_pct: form.max_total_drawdown_pct === "" ? null : Number(form.max_total_drawdown_pct),
      drawdown_type: form.drawdown_type,
      min_trading_days: form.min_trading_days === "" ? null : Number(form.min_trading_days),
      status: form.status,
    };
    if (!payload.name) return;
    onSave(payload, account?.id);
  }

  const showSplit = form.type === "fondeo" || form.status === "funded";

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{isEdit ? "Editar cuenta" : "Nueva cuenta"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. FTMO 100k #1" required autoFocus />
          </div>

          <div className="form-group">
            <label>Tipo de cuenta</label>
            <PillSelect layoutId="account-type-bg" options={ACCOUNT_TYPES} value={form.type} onChange={(v) => set("type", v)} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <PillSelect layoutId="account-status-bg" options={ACCOUNT_STATUS} value={form.status} onChange={(v) => set("status", v)} />
          </div>

          <div className="form-group">
            <label>Empresa / prop firm (opcional)</label>
            <input value={form.prop_firm} onChange={(e) => set("prop_firm", e.target.value)} placeholder="Ej. FTMO, Apex, MyFundedFX" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Balance inicial (USD)</label>
              <input type="number" step="0.01" value={form.starting_balance} onChange={(e) => set("starting_balance", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Comisión total pagada (USD)</label>
              <input type="number" step="0.01" min="0" value={form.total_commission} onChange={(e) => set("total_commission", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="field-hint" style={{ marginTop: "-8px", marginBottom: "13px" }}>
            Total acumulado que te ha cobrado el bróker en comisiones en esta cuenta. Actualizalo cuando quieras, no es por operación.
          </div>

          {showSplit && (
            <div className="form-group">
              <label>% de reparto que te corresponde a vos</label>
              <input type="number" step="1" min="0" max="100" value={form.profit_split} onChange={(e) => set("profit_split", e.target.value)} placeholder="Ej. 80" />
              <div className="field-hint">Según el split que ofrece la empresa. Dejalo vacío si no aplica.</div>
            </div>
          )}

          <div className="section-divider"><span>Reglas / límites (opcional)</span></div>

          <div className="form-group">
            <label>Objetivo de ganancia (%)</label>
            <input type="number" step="0.1" value={form.profit_target_pct} onChange={(e) => set("profit_target_pct", e.target.value)} placeholder="Ej. 10" />
          </div>

          <div className="form-group">
            <label>Pérdida diaria máxima (%)</label>
            <input type="number" step="0.1" value={form.max_daily_loss_pct} onChange={(e) => set("max_daily_loss_pct", e.target.value)} placeholder="Ej. 5" />
          </div>
          <div className="form-group">
            <label>Base de pérdida diaria</label>
            <PillSelect layoutId="daily-loss-type-bg" options={DAILY_LOSS_TYPES} value={form.daily_loss_type} onChange={(v) => set("daily_loss_type", v)} />
          </div>

          <div className="form-group">
            <label>Drawdown máximo total (%)</label>
            <input type="number" step="0.1" value={form.max_total_drawdown_pct} onChange={(e) => set("max_total_drawdown_pct", e.target.value)} placeholder="Ej. 10" />
          </div>
          <div className="form-group">
            <label>Tipo de drawdown</label>
            <PillSelect layoutId="drawdown-type-bg" options={DRAWDOWN_TYPES} value={form.drawdown_type} onChange={(v) => set("drawdown_type", v)} />
          </div>

          <div className="form-group">
            <label>Días mínimos de trading</label>
            <input type="number" step="1" value={form.min_trading_days} onChange={(e) => set("min_trading_days", e.target.value)} placeholder="Opcional" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={busy}>{isEdit ? "Guardar cambios" : "Crear cuenta"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
