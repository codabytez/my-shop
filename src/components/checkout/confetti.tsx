"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/** A gentle shower of glaze-coloured shards — celebratory, but on brand. */
export function Confetti({ colors }: { colors: string[] }) {
  const palette = colors.length ? [...colors, "#E2552B", "#141311"] : ["#E2552B", "#141311", "#E9B97A"];
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        // Deterministic pseudo-random so SSR and client agree.
        left: (i * 37) % 100,
        delay: ((i * 13) % 20) / 20,
        dur: 2.6 + ((i * 7) % 10) / 6,
        size: 6 + ((i * 11) % 10),
        rot: (i * 53) % 360,
        round: i % 3 === 0,
        color: palette[i % palette.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block"
          style={{ left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.45, background: p.color, borderRadius: p.round ? 999 : 1 }}
          initial={{ y: -40, rotate: p.rot, opacity: 1 }}
          animate={{ y: "105vh", rotate: p.rot + 540, x: [0, 30, -20, 10], opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.dur, delay: p.delay + 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      ))}
    </div>
  );
}
