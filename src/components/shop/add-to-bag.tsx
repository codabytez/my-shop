"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { QtyStepper } from "./cart-drawer";
import { useCart } from "./cart-context";

export function AddToBag({ productId, stock }: { productId: string; stock: number }) {
  const { add, pending, error } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = stock < 1;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {!soldOut && <QtyStepper value={qty} max={Math.min(10, stock)} onChange={setQty} />}
        <button
          type="button"
          disabled={soldOut || pending}
          data-cursor-label={soldOut ? "Gone" : "Add"}
          onClick={async () => {
            if (await add(productId, qty)) {
              setAdded(true);
              setTimeout(() => setAdded(false), 2200);
            }
          }}
          className="group relative flex h-16 flex-1 items-center justify-center overflow-hidden rounded-full bg-ink px-10 text-bone disabled:cursor-not-allowed disabled:bg-muted/40"
        >
          {!soldOut && (
            <span className="absolute inset-0 origin-left scale-x-0 bg-ember transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={soldOut ? "sold" : pending ? "pending" : added ? "added" : "idle"}
              className="eyebrow relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {soldOut ? "Sold out — next firing soon" : pending ? "Adding…" : added ? "Added to bag ✓" : "Add to bag"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {!soldOut && stock <= 10 && (
        <p className="eyebrow mt-4 flex items-center gap-2 text-ember">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" /> Only {stock} left from this firing
        </p>
      )}
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
    </div>
  );
}
