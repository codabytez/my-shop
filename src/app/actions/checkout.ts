"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { cartItems, orderItems, orders, products } from "@/db/schema";
import { findCartId } from "@/lib/cart";
import { EmailNotConfiguredError, sendOrderConfirmation } from "@/lib/email";
import { SHIPPING_METHODS, shippingCost, type ShippingMethod } from "@/lib/format";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  addressLine1: z.string().trim().min(3, "Enter your street address").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city").max(120),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  postalCode: z.string().trim().min(2, "Enter your postal code").max(20),
  country: z.string().trim().min(2, "Choose a country").max(80),
  shippingMethod: z.enum(Object.keys(SHIPPING_METHODS) as [ShippingMethod, ...ShippingMethod[]]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
  values?: Record<string, string>;
};

class CheckoutError extends Error {}

function orderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "MRW-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")),
  ) as Record<string, string>;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Please sign in to complete your order.", values };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: CheckoutState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof z.infer<typeof schema>;
      fieldErrors[k] ??= issue.message;
    }
    return { fieldErrors, values };
  }
  const data = parsed.data;

  const cartId = await findCartId();
  if (!cartId) return { error: "Your bag is empty.", values };

  let orderId: string;
  try {
    orderId = await db.transaction(async (tx) => {
      const lines = await tx
        .select({ productId: cartItems.productId, quantity: cartItems.quantity })
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId));
      if (lines.length === 0) throw new CheckoutError("Your bag is empty.");

      // Lock the rows so two shoppers can't buy the last piece at once.
      const stock = await tx
        .select()
        .from(products)
        .where(inArray(products.id, lines.map((l) => l.productId)))
        .for("update");
      const byId = new Map(stock.map((p) => [p.id, p]));

      for (const l of lines) {
        const p = byId.get(l.productId);
        if (!p) throw new CheckoutError("An item in your bag is no longer available.");
        if (p.stock < l.quantity) {
          throw new CheckoutError(
            p.stock === 0
              ? `${p.name} just sold out. Remove it from your bag to continue.`
              : `Only ${p.stock} × ${p.name} left. Adjust your bag to continue.`,
          );
        }
      }

      const subtotal = lines.reduce((n, l) => n + byId.get(l.productId)!.priceCents * l.quantity, 0);
      const shipping = shippingCost(data.shippingMethod, subtotal);

      const [order] = await tx
        .insert(orders)
        .values({
          number: orderNumber(),
          userId,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone || null,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          region: data.region || null,
          postalCode: data.postalCode,
          country: data.country,
          shippingMethod: data.shippingMethod,
          notes: data.notes || null,
          subtotalCents: subtotal,
          shippingCents: shipping,
          totalCents: subtotal + shipping,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lines.map((l) => {
          const p = byId.get(l.productId)!;
          return {
            orderId: order.id,
            productId: p.id,
            name: p.name,
            slug: p.slug,
            shape: p.shape,
            palette: p.palette,
            unitPriceCents: p.priceCents,
            quantity: l.quantity,
          };
        }),
      );

      for (const l of lines) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${l.quantity}` })
          .where(eq(products.id, l.productId));
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      return order.id;
    });
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message, values };
    console.error("[checkout] failed", err);
    return { error: "Something went wrong placing your order. Your order was not placed. Please try again.", values };
  }

  // Email is sent after commit: a Mailgun hiccup must never roll back a real order.
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    await sendOrderConfirmation(order, items);
    await db
      .update(orders)
      .set({ confirmationEmailSentAt: new Date() })
      .where(eq(orders.id, orderId));
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) console.warn(`[checkout] ${err.message} Skipping email.`);
    else console.error("[checkout] confirmation email failed", err);
  }

  // The bag count lives in the root layout; make sure it re-renders empty.
  revalidatePath("/", "layout");
  redirect(`/orders/${orderId}?placed=1`);
}
