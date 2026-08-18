"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function Toasts({ toasts }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
            style={{
              borderColor: t.type === "error" ? "rgba(255,84,112,0.4)" : undefined,
              color: t.type === "error" ? "#ffc2cd" : undefined,
            }}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
