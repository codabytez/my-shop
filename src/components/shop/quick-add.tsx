"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

export function QuickAdd({ productId, name }: { productId: string; name: string }) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setBusy(true);
        await add(productId);
        setBusy(false);
      }}
      data-cursor-label="Add"
      aria-label={`Add ${name} to bag`}
      className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-ink text-xl text-bone transition-all duration-500 ease-[var(--ease-out-expo)] hover:bg-ember md:translate-y-3 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
    >
      <span className={busy ? "animate-spin" : ""}>{busy ? "◌" : "+"}</span>
    </button>
  );
}
