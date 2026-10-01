"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useActionState, useContext, useState } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { ObjectArt } from "@/components/object-art";
import type { CartView } from "@/lib/cart";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  money,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  shippingCost,
  type PaymentMethod,
  type ShippingMethod,
} from "@/lib/format";
import { COUNTRIES } from "./countries";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Identity of the latest submission, so a field can hide its error once edited. */
const SubmissionContext = createContext<object>({});

export function CheckoutForm({ cart, defaults }: { cart: CartView; defaults: Record<string, string> }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const v = { ...defaults, ...state.values };
  const [method, setMethod] = useState<ShippingMethod>((v.shippingMethod as ShippingMethod) in SHIPPING_METHODS ? (v.shippingMethod as ShippingMethod) : "standard");
  const [payment, setPayment] = useState<PaymentMethod>(
    (v.paymentMethod as PaymentMethod) in PAYMENT_METHODS ? (v.paymentMethod as PaymentMethod) : "cash_on_delivery",
  );
  const ship = shippingCost(method, cart.subtotalCents);
  const total = cart.subtotalCents + ship;
  const err = state.fieldErrors ?? {};

  return (
    <SubmissionContext.Provider value={state}>
    <form action={action} className="grid gap-16 lg:grid-cols-12" noValidate>
      <div className="space-y-20 lg:col-span-7">
        <Step n="01" title="Contact">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Field name="email" label="Email" type="email" autoComplete="email" defaultValue={v.email} error={err.email} />
            <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" defaultValue={v.phone} error={err.phone} />
          </div>
        </Step>

        <Step n="02" title="Delivery">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Field className="sm:col-span-2" name="fullName" label="Full name" autoComplete="name" defaultValue={v.fullName} error={err.fullName} />
            <Field className="sm:col-span-2" name="addressLine1" label="Street address" autoComplete="address-line1" defaultValue={v.addressLine1} error={err.addressLine1} />
            <Field className="sm:col-span-2" name="addressLine2" label="Apartment, suite (optional)" autoComplete="address-line2" defaultValue={v.addressLine2} error={err.addressLine2} />
            <Field name="city" label="City" autoComplete="address-level2" defaultValue={v.city} error={err.city} />
            <Field name="region" label="State / region" autoComplete="address-level1" defaultValue={v.region} error={err.region} />
            <Field name="postalCode" label="Postal code" autoComplete="postal-code" defaultValue={v.postalCode} error={err.postalCode} />
            <label className="relative block">
              <span className="eyebrow absolute left-0 top-0 text-muted">Country</span>
              <select name="country" defaultValue={v.country} autoComplete="country-name" className="field appearance-none" aria-invalid={!!err.country}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute bottom-3 right-0 text-muted">↓</span>
            </label>
          </div>
        </Step>

        <Step n="03" title="Shipping">
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((m) => {
              const cost = shippingCost(m, cart.subtotalCents);
              const active = method === m;
              return (
                <label
                  key={m}
                  className={`relative flex cursor-pointer flex-col gap-6 rounded-[2px] border p-6 transition-colors duration-500 ${active ? "border-ink bg-paper" : "border-line hover:border-ink/50"}`}
                >
                  <input type="radio" name="shippingMethod" value={m} checked={active} onChange={() => setMethod(m)} className="sr-only" />
                  <span className="flex items-start justify-between">
                    <span className="text-display text-3xl">{SHIPPING_METHODS[m].label}</span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? "border-ink" : "border-line"}`}>
                      {active && <motion.span layoutId="ship-dot" className="h-2.5 w-2.5 rounded-full bg-ember" />}
                    </span>
                  </span>
                  <span className="flex items-end justify-between">
                    <span className="text-sm text-muted">{SHIPPING_METHODS[m].eta}</span>
                    <span className="font-mono text-sm">{cost === 0 ? "Free" : money(cost)}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {cart.subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS && (
            <p className="mt-4 text-sm text-muted">Standard shipping is free on orders over {money(FREE_SHIPPING_THRESHOLD_CENTS)}.</p>
          )}
        </Step>

        <Step n="04" title="Payment">
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted">
            Nothing is charged online. You pay the courier when your order arrives, and only once you&apos;ve seen it.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => {
              const active = payment === m;
              return (
                <label
                  key={m}
                  className={`relative flex cursor-pointer flex-col gap-6 rounded-[2px] border p-6 transition-colors duration-500 ${active ? "border-ink bg-paper" : "border-line hover:border-ink/50"}`}
                >
                  <input type="radio" name="paymentMethod" value={m} checked={active} onChange={() => setPayment(m)} className="sr-only" />
                  <span className="flex items-start justify-between">
                    <span className="text-display text-3xl">{PAYMENT_METHODS[m].label}</span>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-ink" : "border-line"}`}>
                      {active && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-ember" />}
                    </span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{PAYMENT_METHODS[m].detail}</span>
                </label>
              );
            })}
          </div>
          {err.paymentMethod && <p className="mt-3 text-xs text-ember">{err.paymentMethod}</p>}
        </Step>

        <Step n="05" title="Notes">
          <Field name="notes" label="Anything we should know? (optional)" defaultValue={v.notes} error={err.notes} textarea />
        </Step>
      </div>

      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="rounded-[2px] bg-ink p-6 text-bone md:p-8 lg:sticky lg:top-8">
          <p className="eyebrow mb-6 text-bone/50">Order summary · {cart.count} {cart.count === 1 ? "item" : "items"}</p>
          <ul className="space-y-5" data-lenis-prevent>
            {cart.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-4">
                <div className="relative w-16 shrink-0 overflow-hidden rounded-[2px]">
                  <ObjectArt uid={`co-${l.slug}`} shape={l.shape} palette={l.palette} className="aspect-[4/5] w-full" title={l.name} />
                  <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-[2px] bg-ember px-1 font-mono text-[10px] text-ink">{l.quantity}</span>
                </div>
                <span className="text-display flex-1 text-2xl leading-none">{l.name}</span>
                <span className="font-mono text-sm">{money(l.priceCents * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-8 space-y-3 border-t border-bone/15 pt-6 text-sm">
            <Row label="Subtotal" value={money(cart.subtotalCents)} />
            <Row label={`Shipping · ${SHIPPING_METHODS[method].label}`} value={ship === 0 ? "Free" : money(ship)} animateKey={method} />
            <Row label="Payment" value={PAYMENT_METHODS[payment].label} animateKey={payment} />
          </dl>
          <div className="mt-6 flex items-baseline justify-between border-t border-bone/15 pt-6">
            <span className="eyebrow text-bone/50">Due on delivery</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={total}
                className="text-display text-5xl"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {money(total)}
              </motion.span>
            </AnimatePresence>
          </div>

          {state.error && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[2px] border border-ember/50 p-4 text-sm text-ember" role="alert">
              {state.error}
            </motion.p>
          )}
          {Object.keys(err).length > 0 && !state.error && (
            <p className="mt-6 text-sm text-ember" role="alert">
              Please check the highlighted fields.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            data-cursor-label="Place"
            className="group relative mt-8 flex h-16 w-full items-center justify-between overflow-hidden rounded-full bg-ember px-8 text-ink disabled:opacity-70"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            <span className="eyebrow relative">{pending ? "Placing your order…" : "Place order"}</span>
            <span className="relative font-mono text-sm">{pending ? <span className="inline-block animate-spin">◌</span> : money(total)}</span>
          </button>
          <p className="mt-4 text-center text-xs text-bone/40">No card details needed now. A confirmation email is sent the moment your order is placed.</p>
        </div>
      </aside>
    </form>
    </SubmissionContext.Provider>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <motion.fieldset
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: EASE }}
    >
      <legend className="mb-6 flex w-full items-baseline gap-4 border-b border-ink pb-4">
        <span className="font-mono text-sm text-ember">{n}</span>
        <span className="text-display text-5xl">{title}</span>
      </legend>
      {children}
    </motion.fieldset>
  );
}

function Field({
  name,
  label,
  error,
  className,
  textarea,
  ...rest
}: {
  name: string;
  label: string;
  error?: string;
  className?: string;
  textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  const submission = useContext(SubmissionContext);
  const [editedAfter, setEditedAfter] = useState<object | null>(null);
  if (editedAfter === submission) error = undefined;
  const onEdit = () => editedAfter !== submission && setEditedAfter(submission);
  return (
    <div className={`relative mb-6 ${className ?? ""}`}>
      <label htmlFor={id} className="eyebrow absolute left-0 top-0 text-muted">
        {label}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={3} onInput={onEdit} defaultValue={rest.defaultValue as string} className="field resize-none" aria-invalid={!!error} />
      ) : (
        <input id={id} name={name} onInput={onEdit} className="field" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      )}
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-ember">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, animateKey }: { label: string; value: string; animateKey?: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-bone/60">{label}</dt>
      <motion.dd key={animateKey} initial={animateKey ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="font-mono">
        {value}
      </motion.dd>
    </div>
  );
}
