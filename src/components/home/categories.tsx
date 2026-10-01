"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ObjectArt } from "@/components/object-art";
import type { ProductPalette, ProductShape } from "@/db/schema";

type Cat = { name: string; count: number; blurb: string; cover: { shape: ProductShape; palette: ProductPalette } | null };

export function Categories({ categories }: { categories: Cat[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20 });
  const sy = useSpring(y, { stiffness: 160, damping: 20 });

  return (
    <section
      className="relative px-4 py-32 md:px-8"
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <div className="mb-12 flex items-end justify-between">
        <p className="eyebrow text-muted">( Index )</p>
        <p className="eyebrow text-muted">Hover to preview</p>
      </div>
      <ul onPointerLeave={() => setActive(null)}>
        {categories.map((c, i) => (
          <li key={c.name} onPointerEnter={() => setActive(i)} className="border-t border-line last:border-b">
            <Link
              href={`/shop?category=${c.name}`}
              data-cursor="view"
              data-cursor-label="Explore"
              className="group flex items-baseline justify-between gap-6 py-6 md:py-8"
            >
              <span className="flex items-baseline gap-4 md:gap-10">
                <span className="eyebrow w-8 text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-display text-[15vw] transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-6 group-hover:italic group-hover:text-ember md:text-[8vw]">
                  {c.name}
                </span>
              </span>
              <span className="hidden max-w-xs text-right text-sm text-muted md:block">{c.blurb}</span>
              <sup className="font-mono text-sm text-muted">({c.count})</sup>
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
        style={{ x: sx, y: sy }}
        aria-hidden
      >
        <AnimatePresence mode="popLayout">
          {active !== null && categories[active]?.cover && (
            <motion.div
              key={active}
              className="-translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2px] shadow-2xl"
              initial={{ opacity: 0, scale: 0.6, rotate: -8, clipPath: "inset(50% 0 50% 0)" }}
              animate={{ opacity: 1, scale: 1, rotate: 0, clipPath: "inset(0% 0 0% 0)" }}
              exit={{ opacity: 0, scale: 0.8, rotate: 6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObjectArt uid={`cat-${active}`} shape={categories[active].cover!.shape} palette={categories[active].cover!.palette} className="w-64" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
