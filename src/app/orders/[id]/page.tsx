import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Confetti } from "@/components/checkout/confetti";
import { FadeUp, RevealLines } from "@/components/motion/reveal";
import { ObjectArt } from "@/components/object-art";
import { formatDate, money, PAYMENT_METHODS, SHIPPING_METHODS, type ShippingMethod } from "@/lib/format";
import { getOrderForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "Your order" };

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const [{ id }, sp, session] = await Promise.all([props.params, props.searchParams, auth()]);
  if (!session?.user?.id) redirect(`/signin?from=/orders/${id}`);
  const data = await getOrderForUser(id, session.user.id);
  if (!data) notFound();
  const { order, items } = data;
  const justPlaced = sp.placed === "1";
  const first = order.fullName.split(" ")[0];
  const ship = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  const pay = PAYMENT_METHODS[order.paymentMethod];
  const paid = order.paymentStatus === "paid";

  return (
    <section className="relative px-4 pb-32 pt-36 md:px-8 md:pt-44">
      {justPlaced && <Confetti colors={items.map((i) => i.palette.body)} />}
      <p className="eyebrow mb-6 text-ember">
        {justPlaced ? "Order confirmed" : `Order · ${order.status}`} — {order.number}
      </p>
      <RevealLines
        as="h1"
        immediate
        className="text-display text-[17vw] md:text-[10vw]"
        lines={justPlaced ? ["Thank you,", <em key="n" className="text-ember">{first}.</em>] : [<>Order</>, <em key="n" className="text-ember">{order.number}</em>]}
      />

      <FadeUp delay={0.4} className="mt-10 max-w-xl">
        <p className="text-lg leading-relaxed text-ink/80">
          {justPlaced ? (
            <>
              Your order is in. A confirmation is on its way to <strong className="font-medium">{order.email}</strong>
              {order.confirmationEmailSentAt ? "" : " (it may take a few minutes)"}. Each piece is now being wrapped by hand.
            </>
          ) : (
            <>Placed on {formatDate(order.createdAt)}.</>
          )}
        </p>
      </FadeUp>

      <div className="mt-24 grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-6 border-b border-ink pb-4">Items</p>
          <ul>
            {items.map((it, i) => (
              <FadeUp key={it.id} delay={0.1 * i}>
                <li className="flex items-center gap-6 border-b border-line py-6">
                  <Link href={`/product/${it.slug}`} className="group w-24 shrink-0 overflow-hidden rounded-[2px]" data-cursor="view">
                    <ObjectArt uid={`ord-${it.id}`} shape={it.shape} palette={it.palette} className="aspect-[4/5] w-full" title={it.name} />
                  </Link>
                  <div className="flex-1">
                    <p className="text-display text-3xl leading-none">{it.name}</p>
                    <p className="eyebrow mt-2 text-muted">
                      Qty {it.quantity} × {money(it.unitPriceCents)}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{money(it.unitPriceCents * it.quantity)}</p>
                </li>
              </FadeUp>
            ))}
          </ul>
        </div>

        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div className="rounded-[2px] bg-ink p-8 text-bone">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-bone/60">Subtotal</dt><dd className="font-mono">{money(order.subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-bone/60">Shipping · {ship?.label}</dt><dd className="font-mono">{order.shippingCents === 0 ? "Free" : money(order.shippingCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-bone/60">Payment</dt><dd className="font-mono">{pay.label}</dd></div>
              <div className="flex justify-between"><dt className="text-bone/60">Status</dt><dd className="font-mono">{paid ? "Paid" : "Unpaid"}</dd></div>
            </dl>
            <div className="mt-6 flex items-baseline justify-between border-t border-bone/15 pt-6">
              <span className="eyebrow text-bone/50">{paid ? "Paid" : "Due on delivery"}</span>
              <span className="text-display text-5xl">{money(order.totalCents)}</span>
            </div>
            {!paid && <p className="mt-4 text-xs leading-relaxed text-bone/50">{pay.detail}</p>}
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed">
            <div>
              <p className="eyebrow mb-3 text-muted">Shipping to</p>
              <p>
                {order.fullName}<br />{order.addressLine1}<br />
                {order.addressLine2 && <>{order.addressLine2}<br /></>}
                {[order.city, order.region, order.postalCode].filter(Boolean).join(", ")}<br />{order.country}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3 text-muted">Delivery</p>
              <p>{ship?.label}<br />{ship?.eta}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <Link href="/shop" className="eyebrow link-underline">Keep exploring →</Link>
            <Link href="/account" className="eyebrow link-underline">All orders</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
