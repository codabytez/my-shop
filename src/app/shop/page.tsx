import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp, RevealLines } from "@/components/motion/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { CATEGORIES, listProducts, type SortKey } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

const SORTS: SortKey[] = ["featured", "new", "price-asc", "price-desc"];

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  const category = typeof sp.category === "string" && (CATEGORIES as readonly string[]).includes(sp.category) ? sp.category : undefined;
  const sort = typeof sp.sort === "string" && SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "featured";
  const products = await listProducts({ category, sort });

  const href = (c?: string) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (sort !== "featured") q.set("sort", sort);
    const s = q.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="px-4 pb-32 pt-36 md:px-8 md:pt-44">
      <header className="mb-16 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="eyebrow mb-6 text-muted">( {products.length} objects )</p>
          <RevealLines
            key={category ?? "all"}
            as="h1"
            immediate
            className="text-display text-[20vw] md:text-[11vw]"
            lines={category ? [<em key="c">{category}</em>] : ["All objects"]}
          />
        </div>
        <p className="self-end text-muted md:col-span-4">
          Every object is made in an edition limited by the kiln, not the market. When it&apos;s gone, it&apos;s gone until the next firing.
        </p>
      </header>

      <div className="sticky top-0 z-20 -mx-4 mb-12 flex flex-wrap items-center justify-between gap-4 border-y border-line bg-bone/85 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <nav className="flex flex-wrap gap-2" aria-label="Categories">
          {[undefined, ...CATEGORIES].map((c) => {
            const active = c === category;
            return (
              <Link
                key={c ?? "all"}
                href={href(c)}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`eyebrow rounded-full border px-4 py-2 transition-colors duration-500 ${active ? "border-ink bg-ink text-bone" : "border-line hover:border-ink"}`}
              >
                {c ?? "All"}
              </Link>
            );
          })}
        </nav>
        <SortSelect value={sort} />
      </div>

      {products.length === 0 ? (
        <p className="text-display py-24 text-center text-5xl text-muted">The kiln is cooling. Check back soon.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <FadeUp key={p.id} delay={(i % 3) * 0.08} className={i % 3 === 1 ? "lg:mt-24" : undefined}>
              <ProductCard product={p} index={i} uid={`shop-${p.slug}`} />
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}
