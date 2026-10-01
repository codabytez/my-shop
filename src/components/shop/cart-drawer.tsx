"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";
import { ObjectArt } from "@/components/object-art";
import { useLenis } from "@/components/motion/smooth-scroll";
import { FREE_SHIPPING_THRESHOLD_CENTS, money } from "@/lib/format";
import { useCart } from "./cart-context";

const EASE = [0.76, 0, 0.24, 1] as const;

export function CartDrawer() {
  const { cart, open, setOpen, update, pending, error } = useCart();
  const lenis = useLenis();

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis, setOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - cart.subtotalCents);
  const progress = Math.min(1, cart.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal aria-label="Your bag">
          <motion.button
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-paper text-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.9, ease: EASE }}
            data-lenis-prevent
          >
            <header className="flex items-baseline justify-between border-b border-line px-6 py-6 md:px-10">
              <h2 className="text-display text-5xl">
                Bag <sup className="font-mono text-sm tracking-normal text-ember">({cart.count})</sup>
              </h2>
              <button onClick={() => setOpen(false)} className="eyebrow link-underline">
                Close
              </button>
            </header>

            {cart.lines.length > 0 && (
              <div className="border-b border-line px-6 py-4 md:px-10">
                <p className="eyebrow text-muted">
                  {remaining > 0 ? <>Add {money(remaining)} for free shipping</> : <>Free standard shipping unlocked</>}
                </p>
                <div className="mt-3 h-px w-full bg-line">
                  <motion.div
                    className="h-px bg-ember"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: EASE }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 md:px-10">
              {cart.lines.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-6 py-16">
                  <p className="text-display text-4xl text-muted">Nothing here yet.</p>
                  <Link href="/shop" onClick={() => setOpen(false)} className="eyebrow link-underline">
                    Browse the collection →
                  </Link>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l, i) => (
                      <motion.li
                        key={l.productId}
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.4 } }}
                        className="flex gap-5 border-b border-line py-6"
                      >
                        <Link href={`/product/${l.slug}`} onClick={() => setOpen(false)} className="group block w-24 shrink-0 overflow-hidden rounded-sm">
                          <ObjectArt uid={`cart-${l.slug}`} shape={l.shape} palette={l.palette} className="aspect-[4/5] w-full" title={l.name} />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-display text-2xl leading-none">{l.name}</p>
                              <p className="eyebrow mt-2 text-muted">{l.category}</p>
                            </div>
                            <p className="font-mono text-sm">{money(l.priceCents * l.quantity)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <QtyStepper
                              value={l.quantity}
                              max={Math.min(10, l.stock)}
                              disabled={pending}
                              onChange={(q) => update(l.productId, q)}
                            />
                            <button className="eyebrow text-muted link-underline" onClick={() => update(l.productId, 0)} disabled={pending}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.lines.length > 0 && (
              <footer className="border-t border-line px-6 py-6 md:px-10">
                {error && <p className="mb-3 text-sm text-ember">{error}</p>}
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="eyebrow text-muted">Subtotal</span>
                  <span className="text-display text-4xl">{money(cart.subtotalCents)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  data-cursor-label="Go"
                  className="group relative flex w-full items-center justify-between overflow-hidden rounded-full bg-ink px-7 py-5 text-bone"
                >
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-y-100" />
                  <span className="eyebrow relative">Checkout</span>
                  <span className="relative transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-1">→</span>
                </Link>
                <p className="mt-3 text-center text-xs text-muted">Shipping calculated at checkout.</p>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function QtyStepper({
  value,
  max,
  onChange,
  disabled,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center rounded-full border border-line font-mono text-sm">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="px-3.5 py-1.5 disabled:opacity-30"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-6 text-center tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="px-3.5 py-1.5 disabled:opacity-30"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
