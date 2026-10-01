import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { catalogue } from "../src/db/catalogue";
import { products } from "../src/db/schema";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  for (const [i, p] of catalogue.entries()) {
    await db
      .insert(products)
      .values({ ...p, sort: i, featured: p.featured ?? false, edition: p.edition ?? null })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          category: p.category,
          priceCents: p.priceCents,
          shape: p.shape,
          palette: p.palette,
          details: p.details,
          edition: p.edition ?? null,
          featured: p.featured ?? false,
          sort: i,
          // Only top up stock; never clobber live inventory with a lower number.
          stock: sql`greatest(${products.stock}, ${p.stock})`,
        },
      });
  }
  console.log(`Seeded ${catalogue.length} products.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
