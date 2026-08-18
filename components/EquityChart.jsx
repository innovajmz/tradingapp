"use client";
import { useEffect, useRef } from "react";

export default function EquityChart({ sorted, startingBalance }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const points = [{ balance: startingBalance }, ...sorted.map((e, i) => ({
      balance: startingBalance + sorted.slice(0, i + 1).reduce((s, x) => s + Number(x.pnl), 0),
    }))];

    if (points.length < 2) return;

    const values = points.map((p) => p.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.15 || Math.max(1, Math.abs(min) * 0.05) || 10;
    const lo = min - pad;
    const hi = max + pad;

    const W = rect.width;
    const H = rect.height;
    const marginL = 8, marginR = 8, marginT = 10, marginB = 10;
    const innerW = W - marginL - marginR;
    const innerH = H - marginT - marginB;

    function x(i) {
      return marginL + (i / (points.length - 1)) * innerW;
    }
    function y(v) {
      return marginT + innerH - ((v - lo) / (hi - lo || 1)) * innerH;
    }

    const rising = values[values.length - 1] >= values[0];
    const lineColor = rising ? "#21e6a1" : "#ff4d6a";

    // gradient fill under the line
    const grad = ctx.createLinearGradient(0, marginT, 0, H - marginB);
    grad.addColorStop(0, rising ? "rgba(33,230,161,0.35)" : "rgba(255,77,106,0.35)");
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    points.forEach((p, i) => {
      const px = x(i), py = y(p.balance);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.lineTo(x(points.length - 1), H - marginB);
    ctx.lineTo(x(0), H - marginB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // baseline (starting balance)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.moveTo(marginL, y(startingBalance));
    ctx.lineTo(W - marginR, y(startingBalance));
    ctx.stroke();
    ctx.setLineDash([]);

    // main line with glow
    ctx.beginPath();
    points.forEach((p, i) => {
      const px = x(i), py = y(p.balance);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 10;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // last point dot
    const lastX = x(points.length - 1);
    const lastY = y(values[values.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [sorted, startingBalance]);

  if (!sorted || sorted.length === 0) {
    return (
      <div className="chart-wrap">
        <div className="chart-empty">Registrá tu primer día para ver la curva de equity</div>
      </div>
    );
  }

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
