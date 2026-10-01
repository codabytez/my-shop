import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { RevealLines } from "@/components/motion/reveal";
import { GoogleButton } from "@/components/shop/google-button";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCart } from "@/lib/cart";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [session, cart] = await Promise.all([auth(), getCart()]);

  if (cart.lines.length === 0) {
    return (
      <section className="flex min-h-screen flex-col items-start justify-center px-4 md:px-8">
        <p className="eyebrow mb-6 text-muted">( Checkout )</p>
        <RevealLines as="h1" immediate className="text-display text-[18vw] md:text-[10vw]" lines={["Your bag", <em key="e" className="text-ember">is empty.</em>]} />
        <Link href="/shop" className="eyebrow link-underline mt-12">Find something to love →</Link>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="grid min-h-screen items-center gap-16 px-4 pb-24 pt-36 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <p className="eyebrow mb-6 text-muted">( Step 01 of 02 )</p>
          <RevealLines as="h1" immediate className="text-display text-[16vw] md:text-[8vw]" lines={["Almost", <em key="t" className="text-ember">yours.</em>]} />
          <p className="mt-8 max-w-md leading-relaxed text-muted">
            Sign in with Google to complete your order. Your bag of {cart.count} {cart.count === 1 ? "object" : "objects"} ({money(cart.subtotalCents)}) will be waiting on the other side.
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <GoogleButton redirectTo="/checkout" />
        </div>
      </section>
    );
  }

  // Prefill the address from the shopper's last order.
  const [last] = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id!))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  const defaults: Record<string, string> = {
    email: session.user.email ?? "",
    fullName: last?.fullName ?? session.user.name ?? "",
    phone: last?.phone ?? "",
    addressLine1: last?.addressLine1 ?? "",
    addressLine2: last?.addressLine2 ?? "",
    city: last?.city ?? "",
    region: last?.region ?? "",
    postalCode: last?.postalCode ?? "",
    country: last?.country ?? "United States",
    shippingMethod: last?.shippingMethod ?? "standard",
    paymentMethod: last?.paymentMethod ?? "cash_on_delivery",
    notes: "",
  };

  return (
    <section className="px-4 pb-32 pt-36 md:px-8 md:pt-44">
      <p className="eyebrow mb-6 text-muted">( Checkout )</p>
      <RevealLines as="h1" immediate className="text-display mb-16 text-[18vw] md:text-[9vw]" lines={["Checkout"]} />
      <CheckoutForm cart={cart} defaults={defaults} />
    </section>
  );
}
