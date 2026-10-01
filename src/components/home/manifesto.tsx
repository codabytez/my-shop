"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

const TEXT =
  "We believe the objects you touch first thing in the morning set the tone for everything after. So we make them slowly, by hand, from clay that remembers the fire — and we make only as many as the kiln allows.";

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 40%"] });
  const words = TEXT.split(" ");

  return (
    <section className="px-4 py-32 md:px-8 md:py-48">
      <div className="grid gap-10 md:grid-cols-12">
        <p className="eyebrow text-muted md:col-span-3">( Manifesto )</p>
        <p ref={ref} className="text-display text-[9.5vw] leading-[0.98] md:col-span-9 md:text-[5.2vw]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={w.startsWith("slowly") || w === "fire"}>
              {w}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <span className="relative mr-[0.22em] inline-block">
      <motion.span style={{ opacity }} className={accent ? "italic text-ember" : undefined}>
        {children}
      </motion.span>
    </span>
  );
}
