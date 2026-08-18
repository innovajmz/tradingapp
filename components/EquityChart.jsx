"use client";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatPct } from "@/lib/metrics";
import { useCountUp } from "@/lib/useCountUp";

const EASE = [0.16, 1, 0.3, 1];

const SLOT = 24;
const BODY_W = 14;
const AXIS_W = 56;
const PAD_L = 8;
const PLOT_H = 176;
const PAD_TOP = 10;
const PAD_BOTTOM = 26;

function buildCandles(trades, startingBalance) {
  const sorted = [...trades].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.created_at || "").localeCompare(b.created_at || "");
  });
  let balance = startingBalance;
  return sorted.map((t) => {
    const o = balance;
    const c = balance + Number(t.pnl);
    balance = c;
    return {
      o,
      c,
      h: Math.max(o, c),
      l: Math.min(o, c),
      pnl: Number(t.pnl),
      date: t.date,
      symbol: t.symbol,
      id: t.id,
    };
  });
}

function formatDay(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
  });
}

export default function EquityChart({ trades, startingBalance }) {
  const candles = useMemo(() => buildCandles(trades, startingBalance), [trades, startingBalance]);
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  const n = candles.length;
  const lastClose = n ? candles[n - 1].c : startingBalance;
  const animatedBalance = useCountUp(lastClose);
  const totalPct = n ? ((lastClose - startingBalance) / startingBalance) * 100 : 0;
  const totalUp = totalPct >= 0;

  if (n === 0) {
    return (
      <div className="chart-wrap">
        <div className="chart-empty">Registrá tu primera operación para ver la curva de equity</div>
      </div>
    );
  }

  const plotW = Math.max(n * SLOT, 200);
  const svgW = plotW + AXIS_W + PAD_L;
  const svgH = PAD_TOP + PLOT_H + PAD_BOTTOM;

  const maxHigh = Math.max(startingBalance, ...candles.map((k) => k.h));
  const minLow = Math.min(startingBalance, ...candles.map((k) => k.l));
  const span = maxHigh - minLow || 1;
  const pad = span * 0.12;
  const ceil = maxHigh + pad;
  const floor = minLow - pad;

  const y = (v) => PAD_TOP + (1 - (v - floor) / (ceil - floor)) * PLOT_H;
  const xMid = (i) => PAD_L + i * SLOT + SLOT / 2;

  const ticks = [ceil, floor + (ceil - floor) * 0.66, floor + (ceil - floor) * 0.33, floor];
  const dateLabels = Array.from({ length: Math.min(6, n) }, (_, i) =>
    candles[Math.min(n - 1, Math.floor((i * n) / Math.min(6, n)))]
  );

  const active = hover !== null ? candles[hover] : null;
  const activeUp = active ? active.c >= active.o : totalUp;
  const tipLeft = hover !== null && hover > n / 2;

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = svgW / rect.width;
    const px = (e.clientX - rect.left) * scaleX;
    const idx = Math.floor((px - PAD_L) / SLOT);
    setHover(Math.max(0, Math.min(n - 1, idx)));
  }

  return (
    <div>
      <div className="chart-header">
        <span className="chart-price mono">{formatCurrency(animatedBalance)}</span>
        <span className={`chart-change mono ${totalUp ? "pos" : "neg"}`}>
          {totalUp ? "+" : "-"}{formatPct(Math.abs(totalPct))}
        </span>
      </div>
      <div className="chart-wrap chart-scroll">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
        >
          <defs>
            <clipPath id="reveal">
              <motion.rect
                x={0}
                y={0}
                height={svgH}
                initial={{ width: 0 }}
                animate={{ width: svgW }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </clipPath>
          </defs>

          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={0} x2={plotW + PAD_L} y1={y(t)} y2={y(t)}
                stroke="var(--border-soft)" strokeWidth="1"
              />
              <text x={svgW - 4} y={y(t) + 3} textAnchor="end" className="chart-axis-label mono">
                {formatCurrency(t, { compact: true })}
              </text>
            </g>
          ))}

          <line
            x1={0} x2={plotW + PAD_L} y1={y(startingBalance)} y2={y(startingBalance)}
            stroke="var(--text-dimmer)" strokeWidth="1" strokeDasharray="2 4"
          />

          <g clipPath="url(#reveal)">
            {candles.map((k, i) => {
              const color = k.c >= k.o ? "var(--green)" : "var(--red)";
              const top = y(Math.max(k.o, k.c));
              const bottom = y(Math.min(k.o, k.c));
              const dim = hover !== null && hover !== i;
              return (
                <g key={k.id} opacity={dim ? 0.35 : 1}>
                  <rect
                    x={xMid(i) - BODY_W / 2}
                    y={top}
                    width={BODY_W}
                    height={Math.max(2, bottom - top)}
                    rx={2}
                    fill={color}
                  />
                </g>
              );
            })}
          </g>

          {active && (
            <g pointerEvents="none">
              <line
                x1={xMid(hover)} x2={xMid(hover)} y1={PAD_TOP} y2={PAD_TOP + PLOT_H}
                stroke="var(--text-dimmer)" strokeWidth="1"
              />
              <line
                x1={0} x2={plotW + PAD_L} y1={y(active.c)} y2={y(active.c)}
                stroke={activeUp ? "var(--green)" : "var(--red)"} strokeOpacity="0.5" strokeDasharray="2 3"
              />
              <circle
                cx={xMid(hover)} cy={y(active.c)} r={3.5}
                fill={activeUp ? "var(--green)" : "var(--red)"}
                style={{ filter: `drop-shadow(0 0 4px ${activeUp ? "var(--green)" : "var(--red)"})` }}
              />
            </g>
          )}

          {dateLabels.map((k, i) => (
            <text
              key={i}
              x={xMid(candles.indexOf(k))}
              y={PAD_TOP + PLOT_H + 18}
              textAnchor="middle"
              className="chart-axis-label mono"
            >
              {formatDay(k.date)}
            </text>
          ))}
        </svg>

        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              className="chart-tooltip"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                left: tipLeft ? undefined : xMid(hover) + 10,
                right: tipLeft ? svgW - xMid(hover) + 10 : undefined,
              }}
            >
              <div className="chart-tooltip-date">{formatDay(active.date)}</div>
              <div className="chart-tooltip-row">
                <span>Antes</span>
                <span className="mono">{formatCurrency(active.o)}</span>
              </div>
              <div className="chart-tooltip-row">
                <span>Después</span>
                <span className="mono">{formatCurrency(active.c)}</span>
              </div>
              <div className="chart-tooltip-row">
                <span>Resultado</span>
                <span className={`mono ${active.pnl >= 0 ? "pos" : "neg"}`}>
                  {active.pnl >= 0 ? "+" : ""}{formatCurrency(active.pnl)}
                </span>
              </div>
              {active.symbol && (
                <div className="chart-tooltip-row">
                  <span>Par</span>
                  <span className="mono">{active.symbol}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
