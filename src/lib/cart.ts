import "server-only";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";

export const CART_COOKIE = "morrow_cart";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function cookieCartId() {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

/**
 * Finds the active cart for this request.
 * Signed-in shoppers own a cart row; guests are tracked by cookie. When a guest
 * signs in, their cookie cart is folded into their account cart.
 */
export async function findCartId(): Promise<string | null> {
  const session = await auth();
  const guestId = await cookieCartId();
  const userId = session?.user?.id;

  if (!userId) {
    if (!guestId) return null;
    const [row] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.id, guestId), isNull(carts.userId)))
      .limit(1);
    return row?.id ?? null;
  }

  const [own] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(asc(carts.createdAt))
    .limit(1);

  if (guestId && guestId !== own?.id) {
    const [guest] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.id, guestId), isNull(carts.userId)))
      .limit(1);

    if (guest) {
      if (!own) {
        await db.update(carts).set({ userId }).where(eq(carts.id, guest.id));
        return guest.id;
      }
      await db.transaction(async (tx) => {
        await tx.execute(sql`
          insert into ${cartItems} (cart_id, product_id, quantity)
          select ${own.id}, product_id, quantity from ${cartItems} where cart_id = ${guest.id}
          on conflict (cart_id, product_id)
          do update set quantity = ${cartItems.quantity} + excluded.quantity`);
        await tx.delete(carts).where(eq(carts.id, guest.id));
      });
    }
  }
  return own?.id ?? null;
}

/** Like findCartId, but creates a cart (and cookie) when none exists. Server actions only. */
export async function ensureCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;
  const session = await auth();
  const [cart] = await db
    .insert(carts)
    .values({ userId: session?.user?.id ?? null })
    .returning({ id: carts.id });
  (await cookies()).set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return cart.id;
}

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  shape: (typeof products.$inferSelect)["shape"];
  palette: (typeof products.$inferSelect)["palette"];
  priceCents: number;
  stock: number;
  quantity: number;
};

export type CartView = { id: string | null; lines: CartLine[]; count: number; subtotalCents: number };

export async function getCart(): Promise<CartView> {
  const id = await findCartId();
  if (!id) return { id: null, lines: [], count: 0, subtotalCents: 0 };

  const lines = await db
    .select({
      productId: products.id,
      slug: products.slug,
      name: products.name,
      category: products.category,
      shape: products.shape,
      palette: products.palette,
      priceCents: products.priceCents,
      stock: products.stock,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, id))
    .orderBy(asc(cartItems.addedAt));

  return {
    id,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((n, l) => n + l.priceCents * l.quantity, 0),
  };
}
