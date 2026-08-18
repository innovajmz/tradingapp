"use client";
import { computeMetrics, formatCurrency, badgeClass, riskLevel } from "@/lib/metrics";

const TYPE_LABEL = {
  challenge: "Challenge",
  fondeo: "Fondeo",
  real: "Real",
  live: "Live",
  futuros: "Futuros",
  demo: "Demo",
};

export default function Sidebar({ accounts, entries, selectedId, onSelect, onNew, userEmail, onLogout }) {
  const entriesFor = (id) => entries.filter((e) => e.account_id === id);

  const totalBalance = accounts.reduce((sum, a) => {
    const m = computeMetrics(a, entriesFor(a.id));
    return sum + m.currentBalance;
  }, 0);

  const totalToday = accounts.reduce((sum, a) => {
    const m = computeMetrics(a, entriesFor(a.id));
    return sum + m.todayPnl;
  }, 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M3 17l5-5 4 4 8-9" stroke="url(#sg)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0" stopColor="#7c5cff" />
                <stop offset="1" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">
            Trading<span className="accent-text">Calendar</span>
          </span>
          <span className="brand-sub">Panel de cuentas</span>
        </div>
      </div>

      <div className="sidebar-summary">
        <div className="summary-row">
          <span className="summary-label">Balance total</span>
          <span className="summary-value">{formatCurrency(totalBalance)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Hoy</span>
          <span className={`summary-value ${totalToday > 0 ? "pos" : totalToday < 0 ? "neg" : "neu"}`}>
            {formatCurrency(totalToday)}
          </span>
        </div>
      </div>

      <div className="accounts-head">
        <span>Cuentas ({accounts.length})</span>
        <button className="btn-icon" onClick={onNew} title="Nueva cuenta">+</button>
      </div>

      <div className="accounts-list">
        {accounts.length === 0 && (
          <div className="empty-list-hint">Todavía no tenés cuentas.<br />Creá la primera con el botón +.</div>
        )}
        {accounts.map((a, i) => {
          const m = computeMetrics(a, entriesFor(a.id));
          const risk = Math.max(m.drawdownPct || 0, m.dailyLossPct || 0);
          const level = riskLevel(risk);
          return (
            <button
              key={a.id}
              className={`account-card ${selectedId === a.id ? "active" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => onSelect(a.id)}
            >
              <div className="acc-top">
                <div>
                  <div className="acc-name">{a.name}</div>
                  {a.prop_firm && <div className="acc-firm">{a.prop_firm}</div>}
                </div>
                <span className={badgeClass(a.type)}>{TYPE_LABEL[a.type] || a.type}</span>
              </div>
              <div className="acc-bottom">
                <span className="acc-balance">{formatCurrency(m.currentBalance)}</span>
                <span className={`acc-pnl ${m.totalPnl > 0 ? "pos" : m.totalPnl < 0 ? "neg" : "neu"}`}>
                  {m.totalPnl >= 0 ? "+" : ""}
                  {formatCurrency(m.totalPnl)}
                </span>
              </div>
              {(m.drawdownLimitAmount || m.dailyLossLimitAmount) && (
                <div className="acc-status-strip">
                  <div
                    className={`acc-status-fill ${
                      level === "danger" ? "fill-red" : level === "warning" ? "fill-amber" : "fill-green"
                    }`}
                    style={{ width: `${Math.min(100, risk)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="dot-live" />
          <span title={userEmail}>{userEmail}</span>
        </div>
        <button className="link-btn" onClick={onLogout}>Salir</button>
      </div>
    </aside>
  );
}
