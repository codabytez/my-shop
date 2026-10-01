"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ObjectArt } from "@/components/object-art";
import type { Product } from "@/db/schema";
import { isDark } from "@/lib/color";
import { money } from "@/lib/format";

/**
 * Vertical scroll drives a pinned horizontal track. Each card is a full
 * "poster" in the product's own backdrop colour.
 */
export function HorizontalGallery({ products }: { products: Product[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [products.length]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={section} className="relative bg-ink text-bone" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-8 flex items-end justify-between px-4 md:px-8">
          <h2 className="text-display text-6xl md:text-8xl">
            The <em className="text-ember">Autumn</em> Edit
          </h2>
          <Link href="/shop" className="eyebrow link-underline hidden md:inline">
            View all objects →
          </Link>
        </div>
        <motion.div ref={track} style={{ x }} className="flex gap-4 px-4 will-change-transform md:gap-6 md:px-8">
          {products.map((p, i) => {
            const dark = isDark(p.palette.bg);
            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                data-cursor="view"
                className="group relative block h-[62vh] w-[78vw] shrink-0 overflow-hidden rounded-[2px] md:w-[34vw]"
                style={{ backgroundColor: p.palette.bg, color: dark ? "#EDE8DF" : "#141311" }}
              >
                <ObjectArt uid={`hg-${p.slug}`} shape={p.shape} palette={p.palette} title={p.name} className="absolute inset-0 h-full w-full transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                <div className="absolute inset-x-0 top-0 flex justify-between p-5">
                  <span className="eyebrow">{String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
                  <span className="eyebrow">{p.category}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <h3 className="text-display text-4xl md:text-5xl">{p.name}</h3>
                  <span className="font-mono text-sm">{money(p.priceCents)}</span>
                </div>
              </Link>
            );
          })}
        </motion.div>
        <div className="mx-4 mt-8 h-px bg-bone/15 md:mx-8">
          <motion.div className="h-px bg-ember" style={{ width: bar }} />
        </div>
      </div>
    </section>
  );
}
