"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Masked line-by-line headline reveal. Pass lines as an array. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  as: Tag = "h2",
  immediate = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  immediate?: boolean;
}) {
  const MotionTag = motion[Tag];
  const container: Variants = { show: { transition: { staggerChildren: 0.09, delayChildren: delay } } };
  const line: Variants = {
    hidden: { y: "110%", rotate: 2.5 },
    show: { y: "0%", rotate: 0, transition: { duration: 1.25, ease: EASE } },
  };
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } })}
    >
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span variants={line} className={`block origin-left will-change-transform ${lineClassName ?? ""}`}>
            {l}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function FadeUp({
  children,
  className,
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
