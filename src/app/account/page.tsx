import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import { FadeUp, RevealLines } from "@/components/motion/reveal";
import { ObjectArt } from "@/components/object-art";
import { formatDate, money } from "@/lib/format";
import { listOrdersForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/account");
  const history = await listOrdersForUser(session.user.id);
  const first = session.user.name?.split(" ")[0] ?? "you";

  return (
    <section className="px-4 pb-32 pt-36 md:px-8 md:pt-44">
      <div className="mb-20 flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-6 text-muted">( Account · {session.user.email} )</p>
          <RevealLines as="h1" immediate className="text-display text-[17vw] md:text-[9vw]" lines={["Hello,", <em key="n" className="text-ember">{first}.</em>]} />
        </div>
        <form action={signOutAction}>
          <button className="eyebrow link-underline">Sign out</button>
        </form>
      </div>

      <div className="mb-6 flex items-baseline justify-between border-b border-ink pb-4">
        <h2 className="text-display text-5xl">Orders</h2>
        <span className="font-mono text-sm text-muted">({history.length})</span>
      </div>

      {history.length === 0 ? (
        <div className="py-24">
          <p className="text-display text-4xl text-muted">No orders yet.</p>
          <Link href="/shop" className="eyebrow link-underline mt-6 inline-block">Start your collection →</Link>
        </div>
      ) : (
        <ul>
          {history.map(({ order, items }, i) => (
            <FadeUp key={order.id} delay={i * 0.05}>
              <li>
                <Link href={`/orders/${order.id}`} data-cursor="view" className="group grid items-center gap-6 border-b border-line py-8 md:grid-cols-12">
                  <div className="md:col-span-3">
                    <p className="font-mono text-sm">{order.number}</p>
                    <p className="eyebrow mt-2 text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex -space-x-4 md:col-span-5">
                    {items.slice(0, 5).map((it) => (
                      <div key={it.id} className="w-16 overflow-hidden rounded-full border-2 border-bone transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                        <ObjectArt uid={`acc-${it.id}`} shape={it.shape} palette={it.palette} className="aspect-square w-full" title={it.name} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between md:col-span-4">
                    <span className="flex flex-col items-start gap-1.5">
                      <span className="eyebrow rounded-full border border-line px-3 py-1.5">{order.status}</span>
                      <span className={`eyebrow text-[10px] ${order.paymentStatus === "paid" ? "text-muted" : "text-ember"}`}>
                        {order.paymentStatus === "paid" ? "Paid" : "Pay on delivery"}
                      </span>
                    </span>
                    <span className="text-display text-3xl">{money(order.totalCents)}</span>
                    <span className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">→</span>
                  </div>
                </Link>
              </li>
            </FadeUp>
          ))}
        </ul>
      )}
    </section>
  );
}
