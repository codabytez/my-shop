const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function money(cents: number) {
  return currency.format(cents / 100);
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export const SHIPPING_METHODS = {
  standard: { label: "Standard", eta: "5–7 working days", cents: 1200 },
  express: { label: "Express", eta: "1–2 working days", cents: 2800 },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export function shippingCost(method: ShippingMethod, subtotalCents: number) {
  if (method === "standard" && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return SHIPPING_METHODS[method].cents;
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
