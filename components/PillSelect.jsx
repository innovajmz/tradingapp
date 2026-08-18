"use client";
import { motion } from "framer-motion";

const transition = { type: "spring", bounce: 0.25, duration: 0.5 };

export default function PillSelect({ options, value, onChange, layoutId }) {
  return (
    <div className="pill-select">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            layout
            initial={false}
            animate={{ paddingLeft: active ? 16 : 12, paddingRight: active ? 16 : 12 }}
            transition={transition}
            className={`pill-select-option ${active ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="pill-select-bg"
                transition={transition}
              />
            )}
            <span className="pill-select-label">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
