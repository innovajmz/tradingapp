export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupTradesByDate(trades) {
  const map = new Map();
  for (const t of trades) {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date).push(t);
  }
  return map;
}

function dayTotals(dayTrades) {
  const net = dayTrades.reduce((s, t) => s + Number(t.pnl), 0);
  return { net };
}

export function computeMetrics(account, trades) {
  const byDate = groupTradesByDate(trades);
  const rawDays = [...byDate.entries()]
    .map(([date, dayTrades]) => ({
      date,
      trades: dayTrades.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")),
      ...dayTotals(dayTrades),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const startingBalance = Number(account.starting_balance) || 0;
  const totalCommission = Number(account.total_commission) || 0;
  const totalGrossPnl = rawDays.reduce((s, d) => s + d.net, 0);
  const totalPnl = totalGrossPnl - totalCommission;
  const currentBalance = startingBalance + totalPnl;

  // The daily-loss limit can be based on the fixed starting balance, or
  // (the common prop-firm rule) on the balance at the start of that specific
  // day — independent from whether the *total* drawdown basis is trailing.
  const dailyLossIsDynamic = account.daily_loss_type === "dynamic";
  const maxDailyLossPct = account.max_daily_loss_pct ? Number(account.max_daily_loss_pct) : null;

  let running = startingBalance;
  let peak = startingBalance;
  const days = [];
  for (const d of rawDays) {
    const balanceBeforeDay = running;
    const dailyLossBase = dailyLossIsDynamic ? balanceBeforeDay : startingBalance;
    const dailyLossLimitAmount = maxDailyLossPct ? (dailyLossBase * maxDailyLossPct) / 100 : null;
    const dailyLossPct =
      dailyLossLimitAmount && d.net < 0
        ? Math.min(999, (Math.abs(d.net) / dailyLossLimitAmount) * 100)
        : 0;
    days.push({ ...d, balanceBeforeDay, dailyLossLimitAmount, dailyLossPct });
    running += d.net;
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
  const todayDay = days.find((d) => d.date === today) || null;
  // If today has no trades yet, its limit is based on the balance as it
  // stands right now (i.e. yesterday's close for the dynamic basis).
  const todayDailyLossBase = dailyLossIsDynamic ? currentBalance : startingBalance;
  const dailyLossLimitAmount = maxDailyLossPct
    ? (todayDay ? todayDay.dailyLossLimitAmount : (todayDailyLossBase * maxDailyLossPct) / 100)
    : null;
  const todayPnl = todayDay ? todayDay.net : 0;
  const dailyLossPct = todayDay ? todayDay.dailyLossPct : 0;

  const worstDay = days.reduce(
    (worst, d) => (d.net < worst.pnl ? { date: d.date, pnl: d.net, lossPct: d.dailyLossPct } : worst),
    { date: null, pnl: 0, lossPct: 0 }
  );
  const worstDayLossPct = worstDay.lossPct;

  const traderShare =
    account.profit_split && totalPnl > 0 ? (totalPnl * Number(account.profit_split)) / 100 : 0;
  const firmShare =
    account.profit_split && totalPnl > 0 ? totalPnl - traderShare : 0;

  return {
    days,
    totalPnl,
    totalGrossPnl,
    totalCommission,
    totalTrades: trades.length,
    startingBalance,
    currentBalance,
    peak,
    drawdownAmount,
    drawdownLimitAmount,
    drawdownPct,
    profitTargetAmount,
    profitProgressPct,
    dailyLossLimitAmount,
    todayDay,
    todayPnl,
    dailyLossPct,
    worstDay,
    worstDayLossPct,
    tradingDays: days.length,
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
  if (level === "warning") return "fill-brand";
  if (level === "ok") return "fill-green";
  return "fill-brand";
}

export function formatCurrency(value, { compact = false } = {}) {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (compact && abs >= 1000) {
    const formatted = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(abs);
    return `${sign}$${formatted}`;
  }
  return `${sign}$${abs.toLocaleString("en-US", {
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

export function badgeClass() {
  return "acc-badge";
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
