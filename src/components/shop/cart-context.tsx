"use client";

import { createContext, useCallback, useContext, useState, useTransition } from "react";
import { addToCart, setQuantity } from "@/app/actions/cart";
import type { CartView } from "@/lib/cart";

type Ctx = {
  cart: CartView;
  open: boolean;
  setOpen: (v: boolean) => void;
  pending: boolean;
  error: string | null;
  add: (productId: string, qty?: number) => Promise<boolean>;
  update: (productId: string, qty: number) => void;
};

const CartContext = createContext<Ctx | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ cart, children }: { cart: CartView; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    (productId: string, qty = 1) =>
      new Promise<boolean>((resolve) => {
        start(async () => {
          const res = await addToCart(productId, qty);
          setError(res.ok ? null : res.error);
          if (res.ok) setOpen(true);
          resolve(res.ok);
        });
      }),
    [],
  );

  const update = useCallback((productId: string, qty: number) => {
    start(async () => {
      const res = await setQuantity(productId, qty);
      setError(res.ok ? null : res.error);
    });
  }, []);

  return (
    <CartContext.Provider value={{ cart, open, setOpen, pending, error, add, update }}>
      {children}
    </CartContext.Provider>
  );
}
