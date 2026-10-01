"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Two-part cursor: a precise dot and a lagging ring. Elements opt in to
 * richer states with data attributes:
 *   data-cursor="view"  → ring grows into a labelled disc
 *   data-cursor-label="Add" → custom label text
 * Links and buttons get a subtle grow automatically.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<{ mode: "idle" | "link" | "label"; label?: string }>({ mode: "idle" });
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });
  const pathname = usePathname();

  // The element under the pointer is gone after navigation; reset until it moves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setState({ mode: "idle" }), [pathname]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, [role=button], label, select");
      if (!el) return setState((s) => (s.mode === "idle" ? s : { mode: "idle" }));
      if (el.dataset.cursor === "view" || el.dataset.cursorLabel) {
        const label = el.dataset.cursorLabel ?? "View";
        setState((s) => (s.mode === "label" && s.label === label ? s : { mode: "label", label }));
      } else {
        setState((s) => (s.mode === "link" ? s : { mode: "link" }));
      }
    };
    const leave = () => setHidden(true);
    const press = () => setDown(true);
    const release = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = state.mode === "label" ? 96 : state.mode === "link" ? 56 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: hidden ? 0 : 1 }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border ${state.mode === "label" ? "" : "mix-blend-difference"}`}
          animate={{
            width: size,
            height: size,
            scale: down ? 0.85 : 1,
            backgroundColor: state.mode === "label" ? "rgba(226,85,43,1)" : "rgba(237,232,223,0)",
            borderColor: state.mode === "label" ? "rgba(226,85,43,1)" : "rgba(237,232,223,0.9)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {state.mode === "label" && (
            <motion.span
              key={state.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="eyebrow text-[10px] text-ink"
            >
              {state.label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone mix-blend-difference" />
      </motion.div>
    </div>
  );
}
