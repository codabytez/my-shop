import "server-only";
import { formatDate, money, PAYMENT_METHODS, SHIPPING_METHODS, type ShippingMethod } from "./format";
import type { Order, OrderItem } from "@/db/schema";

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend tag values: ASCII letters, numbers, underscores and dashes only. */
  category?: string;
  /** Same key within 24h → Resend sends once, so a retried action can't double-email. */
  idempotencyKey?: string;
};

export class EmailNotConfiguredError extends Error {}

/**
 * Sends a message through the Resend API.
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */
export async function sendMail(msg: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  // Must be an address on a domain verified in Resend, e.g. "Morrow <orders@yourdomain.com>".
  const from = process.env.EMAIL_FROM;
  const base = (process.env.RESEND_API_BASE ?? "https://api.resend.com").replace(/\/$/, "");

  if (!apiKey || !from) {
    throw new EmailNotConfiguredError("Resend is not configured (RESEND_API_KEY, EMAIL_FROM).");
  }

  const res = await fetch(`${base}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(msg.idempotencyKey ? { "Idempotency-Key": msg.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(msg.category ? { tags: [{ name: "category", value: msg.category }] } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as { id: string };
}

/* ───────────────────────────── Templates ───────────────────────────── */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const siteUrl = () => (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const INK = "#141311";
const BONE = "#EDE8DF";
const EMBER = "#E2552B";
const MUTED = "#7A746B";

function layout(preheader: string, inner: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>Morrow</title></head>
<body style="margin:0;padding:0;background:${BONE};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BONE};">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#F7F4EE;border:1px solid #DDD6CA;">
<tr><td style="padding:28px 40px;border-bottom:1px solid #DDD6CA;font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:6px;color:${INK};">
MORROW<span style="color:${EMBER}">.</span>
</td></tr>
${inner}
<tr><td style="padding:28px 40px;background:${INK};font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#A9A398;">
Objects for slow mornings. Made by hand, in small batches.<br>
<a href="${siteUrl()}" style="color:${BONE};">${esc(siteUrl().replace(/^https?:\/\//, ""))}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function orderConfirmationEmail(order: Order, items: OrderItem[]) {
  const ship = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  const pay = PAYMENT_METHODS[order.paymentMethod];
  const orderUrl = `${siteUrl()}/orders/${order.id}`;
  const firstName = order.fullName.split(" ")[0];

  const rows = items
    .map(
      (it) => `<tr>
<td width="44" style="padding:14px 0;border-bottom:1px solid #E6E0D5;">
  <div style="width:36px;height:36px;border-radius:18px;background:${esc(it.palette.body)};box-shadow:inset -6px -6px 0 rgba(0,0,0,.18);"></div>
</td>
<td style="padding:14px 12px;border-bottom:1px solid #E6E0D5;font-family:Georgia,serif;font-size:16px;color:${INK};">
  ${esc(it.name)}<br><span style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};">Qty ${it.quantity} &times; ${money(it.unitPriceCents)}</span>
</td>
<td align="right" style="padding:14px 0;border-bottom:1px solid #E6E0D5;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};">
  ${money(it.unitPriceCents * it.quantity)}
</td></tr>`,
    )
    .join("");

  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;font-size:${strong ? 16 : 13}px;color:${strong ? INK : MUTED};${strong ? "font-weight:bold;" : ""}">${label}</td>
<td align="right" style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;font-size:${strong ? 16 : 13}px;color:${INK};${strong ? "font-weight:bold;" : ""}">${value}</td></tr>`;

  const address = [
    order.fullName,
    order.addressLine1,
    order.addressLine2,
    [order.city, order.region, order.postalCode].filter(Boolean).join(", "),
    order.country,
  ]
    .filter(Boolean)
    .map((s) => esc(s!))
    .join("<br>");

  const html = layout(
    `Order ${order.number} is confirmed. We're preparing your pieces.`,
    `<tr><td style="padding:48px 40px 8px;">
<p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${EMBER};">Order confirmed &middot; ${esc(order.number)}</p>
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:40px;line-height:44px;color:${INK};">Thank you, ${esc(firstName)}.</h1>
<p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#4A453F;">
Your order was placed on ${formatDate(order.createdAt)}. Each piece is now being wrapped by hand in our studio. We'll write again the moment it leaves.
</p></td></tr>
<tr><td style="padding:32px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
<tr><td style="padding:16px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${line("Subtotal", money(order.subtotalCents))}
${line(`Shipping &middot; ${esc(ship?.label ?? order.shippingMethod)}`, order.shippingCents === 0 ? "Free" : money(order.shippingCents))}
${line("Total due on delivery", money(order.totalCents), true)}
</table></td></tr>
<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${EMBER};"><tr><td style="padding:16px 20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#4A453F;">
<strong style="color:${INK};">${esc(pay.label)}.</strong> ${esc(pay.detail)} Nothing has been charged yet.
</td></tr></table></td></tr>
<tr><td style="padding:32px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" width="50%" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#4A453F;">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Shipping to</p>${address}</td>
<td valign="top" width="50%" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#4A453F;">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Delivery</p>${esc(ship?.label ?? "")}<br>${esc(ship?.eta ?? "")}</td>
</tr></table></td></tr>
<tr><td style="padding:40px 40px 48px;">
<a href="${orderUrl}" style="display:inline-block;padding:16px 28px;background:${INK};color:${BONE};font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:999px;">View your order</a>
</td></tr>`,
  );

  const text = [
    `Thank you, ${firstName}. Order ${order.number} is confirmed.`,
    "",
    ...items.map((it) => `${it.quantity} × ${it.name} — ${money(it.unitPriceCents * it.quantity)}`),
    "",
    `Subtotal: ${money(order.subtotalCents)}`,
    `Shipping: ${order.shippingCents === 0 ? "Free" : money(order.shippingCents)}`,
    `Total due on delivery: ${money(order.totalCents)}`,
    `Payment: ${pay.label}. ${pay.detail}`,
    "",
    `View your order: ${orderUrl}`,
  ].join("\n");

  return { subject: `Your Morrow order ${order.number} is confirmed`, html, text };
}

export async function sendOrderConfirmation(order: Order, items: OrderItem[]) {
  const { subject, html, text } = orderConfirmationEmail(order, items);
  return sendMail({
    to: order.email,
    subject,
    html,
    text,
    category: "order_confirmation",
    idempotencyKey: `order-confirmation/${order.id}`,
  });
}

export async function sendWelcomeEmail({ to, name }: { to: string; name: string | null }) {
  const first = name?.split(" ")[0] ?? "there";
  const html = layout(
    "Welcome to Morrow.",
    `<tr><td style="padding:48px 40px;">
<h1 style="margin:0;font-family:Georgia,serif;font-weight:normal;font-size:40px;line-height:44px;color:${INK};">Welcome, ${esc(first)}.</h1>
<p style="margin:16px 0 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#4A453F;">
Your account is ready. Everything you order will live here, from the first unboxing to the hundredth morning coffee.</p>
<a href="${siteUrl()}/shop" style="display:inline-block;padding:16px 28px;background:${EMBER};color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:999px;">Explore the collection</a>
</td></tr>`,
  );
  return sendMail({
    to,
    subject: "Welcome to Morrow",
    html,
    text: `Welcome, ${first}. Your Morrow account is ready: ${siteUrl()}/shop`,
    category: "welcome",
  });
}
