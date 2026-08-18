export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeMetrics(account, entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const totalPnl = sorted.reduce((s, e) => s + Number(e.pnl), 0);
  const startingBalance = Number(account.starting_balance) || 0;
  const currentBalance = startingBalance + totalPnl;

  let running = startingBalance;
  let peak = startingBalance;
  for (const e of sorted) {
    running += Number(e.pnl);
    if (running > peak) peak = running;
  }

  const drawdownBase = account.drawdown_type === "trailing" ? peak : startingBalance;
  const drawdownAmount = Math.max(0, drawdownBase - currentBalance);
  const drawdownLimitAmount = account.max_total_drawdown_pct
    ? (startingBalance * Number(account.max_total_drawdown_pct)) / 100
    : null;
  const drawdownPct = drawdownLimitAmount
    ? Math.min(999, (drawdownAmount / drawdownLimitAmount) * 100)
    : null;

  const profitTargetAmount = account.profit_target_pct
    ? (startingBalance * Number(account.profit_target_pct)) / 100
    : null;
  const profitProgressPct = profitTargetAmount
    ? Math.min(999, (totalPnl / profitTargetAmount) * 100)
    : null;

  const today = todayStr();
  const todayEntry = sorted.find((e) => e.date === today) || null;
  const dailyLossLimitAmount = account.max_daily_loss_pct
    ? (startingBalance * Number(account.max_daily_loss_pct)) / 100
    : null;
  const todayPnl = todayEntry ? Number(todayEntry.pnl) : 0;
  const dailyLossPct =
    dailyLossLimitAmount && todayPnl < 0
      ? Math.min(999, (Math.abs(todayPnl) / dailyLossLimitAmount) * 100)
      : 0;

  const worstDay = sorted.reduce(
    (worst, e) => (Number(e.pnl) < worst.pnl ? { date: e.date, pnl: Number(e.pnl) } : worst),
    { date: null, pnl: 0 }
  );
  const worstDayLossPct =
    dailyLossLimitAmount && worstDay.pnl < 0
      ? Math.min(999, (Math.abs(worstDay.pnl) / dailyLossLimitAmount) * 100)
      : 0;

  const traderShare =
    account.profit_split && totalPnl > 0 ? (totalPnl * Number(account.profit_split)) / 100 : 0;
  const firmShare =
    account.profit_split && totalPnl > 0 ? totalPnl - traderShare : 0;

  return {
    sorted,
    totalPnl,
    startingBalance,
    currentBalance,
    peak,
    drawdownAmount,
    drawdownLimitAmount,
    drawdownPct,
    profitTargetAmount,
    profitProgressPct,
    dailyLossLimitAmount,
    todayEntry,
    todayPnl,
    dailyLossPct,
    worstDay,
    worstDayLossPct,
    tradingDays: sorted.length,
    traderShare,
    firmShare,
  };
}

export function riskLevel(pct) {
  if (pct === null || pct === undefined) return "none";
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "ok";
}

export function fillClass(level) {
  if (level === "danger") return "fill-red";
  if (level === "warning") return "fill-amber";
  if (level === "ok") return "fill-green";
  return "fill-accent";
}

export function formatCurrency(value) {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(value, digits = 1) {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

export const ACCOUNT_TYPES = [
  { value: "challenge", label: "Challenge" },
  { value: "fondeo", label: "Fondeo" },
  { value: "real", label: "Real" },
  { value: "live", label: "Live" },
  { value: "futuros", label: "Futuros" },
  { value: "demo", label: "Demo" },
];

export const ACCOUNT_STATUS = [
  { value: "active", label: "Activa" },
  { value: "passed", label: "Aprobada" },
  { value: "failed", label: "Fallida" },
  { value: "funded", label: "Fondeada" },
];

export function badgeClass(type) {
  return `acc-badge badge-${type}`;
}

export function typeIcon(type) {
  switch (type) {
    case "challenge":
      return "🎯";
    case "fondeo":
      return "🏦";
    case "real":
      return "💳";
    case "live":
      return "⚡";
    case "futuros":
      return "📉";
    case "demo":
      return "🧪";
    default:
      return "📈";
  }
}
