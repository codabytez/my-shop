"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function Details({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-b border-line">
      {items.map(([title, body], i) => (
        <div key={title} className="border-t border-line">
          <button
            type="button"
            className="flex w-full items-center justify-between py-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="eyebrow">{title}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-xl leading-none">
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="max-w-md pb-6 text-sm leading-relaxed text-muted">{body}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
