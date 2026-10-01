import "server-only";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const CATEGORIES = ["Vessels", "Light", "Table", "Objects"] as const;

export type SortKey = "featured" | "price-asc" | "price-desc" | "new";

export async function listProducts(opts: { category?: string; sort?: SortKey } = {}) {
  const order =
    opts.sort === "price-asc"
      ? [asc(products.priceCents)]
      : opts.sort === "price-desc"
        ? [desc(products.priceCents)]
        : opts.sort === "new"
          ? [desc(products.createdAt), asc(products.sort)]
          : [desc(products.featured), asc(products.sort)];

  return db
    .select()
    .from(products)
    .where(opts.category ? eq(products.category, opts.category) : undefined)
    .orderBy(...order);
}

export async function featuredProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.featured, true))
    .orderBy(asc(products.sort));
}

export async function getProduct(slug: string) {
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return p ?? null;
}

export async function relatedProducts(slug: string, category: string) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.category, category), ne(products.slug, slug)))
    .orderBy(asc(products.sort))
    .limit(3);
}
