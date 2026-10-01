"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { ensureCartId, findCartId } from "@/lib/cart";

const MAX_QTY = 10;
const productId = z.string().uuid();

export type CartActionResult = { ok: true } | { ok: false; error: string };

async function touch(cartId: string) {
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
  refresh();
}

export async function addToCart(id: string, quantity = 1): Promise<CartActionResult> {
  const pid = productId.safeParse(id);
  const qty = z.number().int().min(1).max(MAX_QTY).safeParse(quantity);
  if (!pid.success || !qty.success) return { ok: false, error: "Invalid request" };

  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, pid.data))
    .limit(1);
  if (!product) return { ok: false, error: "This piece no longer exists" };
  if (product.stock < 1) return { ok: false, error: "Sold out" };

  const cartId = await ensureCartId();
  const cap = Math.min(MAX_QTY, product.stock);
  await db
    .insert(cartItems)
    .values({ cartId, productId: pid.data, quantity: Math.min(qty.data, cap) })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity: sql`least(${cartItems.quantity} + ${qty.data}, ${cap})` },
    });
  await touch(cartId);
  return { ok: true };
}

export async function setQuantity(id: string, quantity: number): Promise<CartActionResult> {
  const pid = productId.safeParse(id);
  const qty = z.number().int().min(0).max(MAX_QTY).safeParse(quantity);
  if (!pid.success || !qty.success) return { ok: false, error: "Invalid request" };

  const cartId = await findCartId();
  if (!cartId) return { ok: false, error: "Your bag is empty" };

  const where = and(eq(cartItems.cartId, cartId), eq(cartItems.productId, pid.data));
  if (qty.data === 0) {
    await db.delete(cartItems).where(where);
  } else {
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, pid.data))
      .limit(1);
    const capped = Math.min(qty.data, product?.stock ?? 0);
    if (capped < 1) await db.delete(cartItems).where(where);
    else await db.update(cartItems).set({ quantity: capped }).where(where);
  }
  await touch(cartId);
  return { ok: true };
}

export async function removeFromCart(id: string) {
  return setQuantity(id, 0);
}
