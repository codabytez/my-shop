"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { RevealLines } from "@/components/motion/reveal";
import { ShaderCanvas } from "@/components/motion/shader-canvas";
import { ObjectArt } from "@/components/object-art";
import type { ProductPalette, ProductShape } from "@/db/schema";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ hero }: { hero: { shape: ProductShape; palette: ProductPalette; name: string; slug: string } | null }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const objY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-bone">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <ShaderCanvas className="h-full w-full" />
      </motion.div>

      {hero && (
        <motion.div
          className="pointer-events-none absolute right-[-2%] top-[17%] w-[44vw] max-w-[520px] md:bottom-[6%] md:right-[10%] md:top-auto md:w-[30vw]"
          style={{ y: objY }}
          initial={{ opacity: 0, y: 80, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: EASE, delay: 0.6 }}
        >
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
            <ObjectArt uid="hero" shape={hero.shape} palette={hero.palette} bare className="w-full drop-shadow-[0_60px_60px_rgba(0,0,0,0.45)]" title={hero.name} />
          </motion.div>
        </motion.div>
      )}

      <motion.div className="relative z-10 flex h-full flex-col justify-between px-4 pb-8 pt-28 md:px-8" style={{ opacity: fade }}>
        <div className="flex items-start justify-between">
          <motion.p
            className="eyebrow max-w-[16rem] text-bone/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            Autumn collection — Nº 07
            <br />
            Twelve objects, four studios
          </motion.p>
          <RotatingBadge />
        </div>

        <div>
          <RevealLines
            as="h1"
            immediate
            delay={0.3}
            className="text-display text-[19vw] md:text-[12.5vw]"
            lines={[
              <>Objects for</>,
              <>
                <em className="text-ember">slow</em> mornings
              </>,
            ]}
          />
          <div className="mt-8 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <motion.p
              className="max-w-md text-base leading-relaxed text-bone/75 md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1.2, ease: EASE }}
            >
              Hand-thrown ceramics and quiet light, fired at 1280° by independent studios and made to outlast every trend you own.
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 1.2, ease: EASE }}>
              <Magnetic>
                <Link
                  href="/shop"
                  data-cursor-label="Enter"
                  className="group relative grid h-36 w-36 place-items-center overflow-hidden rounded-full border border-bone/40 md:h-44 md:w-44"
                >
                  <span className="absolute inset-0 scale-0 rounded-full bg-ember transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-100" />
                  <span className="eyebrow relative text-center">
                    Shop the
                    <br />
                    collection
                  </span>
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="eyebrow text-bone/50">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-bone/20">
          <motion.span
            className="absolute left-0 top-0 h-1/2 w-px bg-bone"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: [0.76, 0, 0.24, 1] }}
          />
        </span>
      </motion.div>
    </section>
  );
}

function RotatingBadge() {
  const text = "Hand thrown · Small batch · Fired at 1280° · ";
  return (
    <motion.div
      className="relative hidden h-28 w-28 md:block"
      initial={{ opacity: 0, rotate: -90 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ delay: 1.4, duration: 1.6, ease: EASE }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow">
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-bone font-mono text-[8.4px] uppercase tracking-[0.2em]">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl text-ember">✺</span>
    </motion.div>
  );
}
