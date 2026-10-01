"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-context";

const LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=Vessels", label: "Vessels" },
  { href: "/shop?category=Light", label: "Light" },
  { href: "/shop?category=Table", label: "Table" },
];

const EASE = [0.76, 0, 0.24, 1] as const;

export function Nav({ user }: { user: { name: string | null; image: string | null } | null }) {
  const { cart, setOpen } = useCart();
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 160 && y > prev && !menu);
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu on navigation
  useEffect(() => setMenu(false), [pathname]);

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "•";

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 text-bone mix-blend-difference"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center justify-between px-4 py-5 md:px-8">
          <Link href="/" className="text-display text-[28px] leading-none tracking-[-0.02em]" aria-label="Morrow — home">
            Morrow<span className="text-ember">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="eyebrow link-underline">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {user ? (
              <Link href="/account" className="hidden items-center gap-2 md:flex" aria-label="Your account">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-bone/70 font-mono text-[11px]">{initial}</span>
              </Link>
            ) : (
              <Link href="/signin" className="eyebrow link-underline hidden md:inline">
                Sign in
              </Link>
            )}
            <button onClick={() => setOpen(true)} className="eyebrow flex items-center gap-2" aria-label={`Open bag, ${cart.count} items`}>
              Bag
              <motion.span
                key={cart.count}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
                className="grid h-6 min-w-6 place-items-center rounded-full bg-bone px-1.5 text-[10px] text-ink"
              >
                {cart.count}
              </motion.span>
            </button>
            <button className="eyebrow md:hidden" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu">
              {menu ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-4 pb-10 text-bone md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <ul className="space-y-1">
              {[...LINKS, user ? { href: "/account", label: "Account" } : { href: "/signin", label: "Sign in" }].map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href={l.href} className="text-display block text-[16vw] leading-[0.95]">
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
