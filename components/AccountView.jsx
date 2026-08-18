"use client";
import {
  computeMetrics,
  formatCurrency,
  formatPct,
  riskLevel,
  fillClass,
  badgeClass,
  typeCode,
  todayStr,
} from "@/lib/metrics";
import { useCountUp } from "@/lib/useCountUp";
import EquityChart from "@/components/EquityChart";

const TYPE_LABEL = {
  challenge: "Challenge",
  fondeo: "Fondeo",
  real: "Real",
  live: "Live",
  futuros: "Futuros",
  demo: "Demo",
};
const STATUS_LABEL = { active: "Activa", passed: "Aprobada", failed: "Fallida", funded: "Fondeada" };

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, date: dateStr });
  }
  return cells;
}

export default function AccountView({ account, trades, month, setMonth, onEdit, onDelete, onDayClick }) {
  const m = computeMetrics(account, trades);
  const animatedBalance = useCountUp(m.currentBalance);
  const today = todayStr();

  const drawdownLevel = riskLevel(m.drawdownPct);
  const dailyLossLevel = riskLevel(m.dailyLossPct);
  const targetHit = m.profitProgressPct !== null && m.profitProgressPct >= 100;

  const cells = buildCalendarDays(month.y, month.m);
  const dayByDate = Object.fromEntries(m.days.map((d) => [d.date, d]));

  function goMonth(delta) {
    let y = month.y, mm = month.m + delta;
    if (mm < 0) { mm = 11; y -= 1; }
    if (mm > 11) { mm = 0; y += 1; }
    setMonth({ y, m: mm });
  }

  const showSplit = account.profit_split && (account.type === "fondeo" || account.status === "funded") && m.totalPnl > 0;

  return (
    <div className="view">
      <div className="acc-header">
        <div className="acc-header-left">
          <div className="acc-avatar">{typeCode(account.type)}</div>
          <div>
            <div className="acc-title-row">
              <h1 className="acc-h1">{account.name}</h1>
              <span className={badgeClass(account.type)}>{TYPE_LABEL[account.type] || account.type}</span>
              <span className="acc-badge">{STATUS_LABEL[account.status] || account.status}</span>
            </div>
            <div className="acc-header-sub">
              {account.prop_firm ? `${account.prop_firm} · ` : ""}Balance inicial {formatCurrency(account.starting_balance)}
            </div>
          </div>
        </div>
        <div className="acc-header-actions">
          <button className="btn-ghost" onClick={onEdit}>Editar</button>
          <button className="btn-ghost danger" onClick={onDelete}>Eliminar</button>
        </div>
      </div>

      {drawdownLevel === "danger" && (
        <div className="alert-banner alert-danger">
          <span className="alert-tag">DRAWDOWN</span>
          Estás a {formatPct(100 - Math.min(100, m.drawdownPct))} de romper el drawdown máximo permitido
          ({formatPct(m.drawdownPct)} del límite ya usado).
        </div>
      )}
      {drawdownLevel === "warning" && (
        <div className="alert-banner alert-warning">
          <span className="alert-tag">DRAWDOWN</span>
          Vas usando {formatPct(m.drawdownPct)} de tu drawdown máximo permitido. Cuidado con el riesgo.
        </div>
      )}
      {dailyLossLevel === "danger" && (
        <div className="alert-banner alert-danger">
          <span className="alert-tag">PÉRDIDA DIARIA</span>
          Hoy vas usando {formatPct(m.dailyLossPct)} de tu límite de pérdida diaria.
        </div>
      )}
      {dailyLossLevel === "warning" && (
        <div className="alert-banner alert-warning">
          <span className="alert-tag">PÉRDIDA DIARIA</span>
          Hoy vas usando {formatPct(m.dailyLossPct)} de tu límite de pérdida diaria. Frená si se acerca al 100%.
        </div>
      )}
      {targetHit && (
        <div className="alert-banner alert-success">
          <span className="alert-tag">OBJETIVO</span>
          Meta de ganancia alcanzada. Llevás {formatCurrency(m.totalPnl)} de tu objetivo de {formatCurrency(m.profitTargetAmount)}.
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card" style={{ "--stat-accent": "var(--brand)" }}>
          <div className="stat-label">Balance actual</div>
          <div className="stat-value">{formatCurrency(animatedBalance)}</div>
          <div className="stat-sub">Inicial: {formatCurrency(account.starting_balance)}</div>
        </div>
        <div className="stat-card" style={{ "--stat-accent": m.totalPnl >= 0 ? "var(--green)" : "var(--red)" }}>
          <div className="stat-label">Ganancia / pérdida total</div>
          <div className={`stat-value ${m.totalPnl > 0 ? "pos" : m.totalPnl < 0 ? "neg" : "neu"}`}>
            {m.totalPnl >= 0 ? "+" : ""}{formatCurrency(m.totalPnl)}
          </div>
          <div className="stat-sub">{m.tradingDays} día{m.tradingDays === 1 ? "" : "s"} operado{m.tradingDays === 1 ? "" : "s"}</div>
        </div>
        <div className="stat-card" style={{ "--stat-accent": targetHit ? "var(--green)" : "var(--brand)" }}>
          <div className="stat-label">Meta de ganancia</div>
          {m.profitTargetAmount ? (
            <>
              <div className="stat-value">{formatPct(m.profitProgressPct)}</div>
              <div className="stat-sub">{formatCurrency(m.totalPnl)} de {formatCurrency(m.profitTargetAmount)}</div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${targetHit ? "fill-green" : "fill-brand"}`}
                  style={{ width: `${Math.max(0, Math.min(100, m.profitProgressPct))}%` }}
                />
              </div>
            </>
          ) : (
            <div className="stat-sub">Sin objetivo configurado</div>
          )}
        </div>
        <div className="stat-card" style={{ "--stat-accent": dailyLossLevel === "danger" ? "var(--red)" : "var(--brand)" }}>
          <div className="stat-label">Pérdida diaria (hoy)</div>
          {m.dailyLossLimitAmount ? (
            <>
              <div className={`stat-value ${m.todayPnl < 0 ? "neg" : m.todayPnl > 0 ? "pos" : "neu"}`}>
                {m.todayDay ? `${m.todayPnl >= 0 ? "+" : ""}${formatCurrency(m.todayPnl)}` : "Sin operar"}
              </div>
              <div className="stat-sub">
                Límite: {formatCurrency(m.dailyLossLimitAmount)} ({formatPct(m.dailyLossPct)} usado)
                {account.daily_loss_type === "dynamic" ? " · dinámico" : " · estático"}
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${fillClass(dailyLossLevel)}`} style={{ width: `${Math.min(100, m.dailyLossPct)}%` }} />
              </div>
            </>
          ) : (
            <div className="stat-sub">Sin límite configurado</div>
          )}
        </div>
        <div className="stat-card" style={{ "--stat-accent": drawdownLevel === "danger" ? "var(--red)" : "var(--brand)" }}>
          <div className="stat-label">Drawdown total</div>
          {m.drawdownLimitAmount ? (
            <>
              <div className="stat-value">{formatPct(m.drawdownPct)}</div>
              <div className="stat-sub">
                {formatCurrency(m.drawdownAmount)} de {formatCurrency(m.drawdownLimitAmount)}
                {account.drawdown_type === "trailing" ? " · trailing" : " · estático"}
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${fillClass(drawdownLevel)}`} style={{ width: `${Math.min(100, m.drawdownPct)}%` }} />
              </div>
            </>
          ) : (
            <div className="stat-sub">Sin límite configurado</div>
          )}
        </div>
        <div className="stat-card" style={{ "--stat-accent": "var(--red)" }}>
          <div className="stat-label">Comisiones pagadas</div>
          <div className="stat-value neg">{m.totalCommission > 0 ? "-" : ""}{formatCurrency(m.totalCommission)}</div>
          <div className="stat-sub">
            {m.totalTrades} operación{m.totalTrades === 1 ? "" : "es"} · bruto {formatCurrency(m.totalGrossPnl)}
          </div>
        </div>
        {account.min_trading_days ? (
          <div className="stat-card" style={{ "--stat-accent": "var(--green)" }}>
            <div className="stat-label">Días mínimos requeridos</div>
            <div className="stat-value">{m.tradingDays}/{account.min_trading_days}</div>
            <div className="progress-track">
              <div
                className={`progress-fill ${m.tradingDays >= account.min_trading_days ? "fill-green" : "fill-brand"}`}
                style={{ width: `${Math.min(100, (m.tradingDays / account.min_trading_days) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="panel-row">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Calendario</span>
            <div className="month-nav">
              <button className="nav-btn" onClick={() => goMonth(-1)}>‹</button>
              <span className="month-label">{MONTHS[month.m]} {month.y}</span>
              <button className="nav-btn" onClick={() => goMonth(1)}>›</button>
            </div>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((cell, i) => {
              if (!cell) return <div key={`e${i}`} className="cal-cell empty" />;
              const day = dayByDate[cell.date];
              const pnl = day ? day.net : null;
              const isToday = cell.date === today;
              const isBreach =
                day && day.dailyLossLimitAmount && pnl < 0 && Math.abs(pnl) >= day.dailyLossLimitAmount;
              const cls = [
                "cal-cell",
                isToday ? "today" : "",
                pnl > 0 ? "has-profit" : "",
                pnl < 0 ? "has-loss" : "",
                isBreach ? "breach" : "",
              ].filter(Boolean).join(" ");
              return (
                <button key={cell.date} className={cls} onClick={() => onDayClick(cell.date)} style={{ animationDelay: `${i * 8}ms` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="cal-daynum">{cell.day}</span>
                    {day && day.trades.length > 1 && (
                      <span style={{ fontSize: "9px", color: "var(--text-dimmer)", fontWeight: 700 }}>{day.trades.length}×</span>
                    )}
                  </div>
                  {pnl !== null && (
                    <span className={`cal-pnl ${pnl > 0 ? "pos" : pnl < 0 ? "neg" : "neu"}`}>
                      {pnl >= 0 ? "+" : ""}{formatCurrency(pnl, { compact: true })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <div className="card-head">
              <span className="card-title">Curva de equity</span>
            </div>
            <EquityChart trades={trades} startingBalance={m.startingBalance} />
          </div>

          {showSplit && (
            <div className="card">
              <div className="card-head">
                <span className="card-title">Reparto de ganancias ({account.profit_split}%)</span>
              </div>
              <div className="split-box">
                <div className="split-row">
                  <span className="lbl">Tu parte</span>
                  <span className="val pos">{formatCurrency(m.traderShare)}</span>
                </div>
                <div className="split-row">
                  <span className="lbl">Parte de la firma</span>
                  <span className="val neu">{formatCurrency(m.firmShare)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
