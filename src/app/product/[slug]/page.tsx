import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp, RevealLines } from "@/components/motion/reveal";
import { ObjectArt } from "@/components/object-art";
import { AddToBag } from "@/components/shop/add-to-bag";
import { Details } from "@/components/shop/details";
import { ProductCard } from "@/components/shop/product-card";
import { getProduct, relatedProducts } from "@/lib/catalog";
import { isDark } from "@/lib/color";
import { money } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.tagline } : { title: "Not found" };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await relatedProducts(product.slug, product.category);
  const dark = isDark(product.palette.bg);

  return (
    <>
      <section className="grid md:grid-cols-2">
        <div
          className="relative h-[85svh] md:sticky md:top-0 md:h-screen"
          style={{ backgroundColor: product.palette.bg, color: dark ? "#EDE8DF" : "#141311" }}
        >
          <ObjectArt uid={`pdp-${product.slug}`} shape={product.shape} palette={product.palette} title={product.name} className="group h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between p-4 md:p-8">
            <span className="eyebrow">{product.details.origin}</span>
            <span className="eyebrow">{product.details.dimensions}</span>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 pb-24 pt-12 md:min-h-screen md:px-12 md:pt-32 lg:px-20">
          <nav className="eyebrow mb-10 flex gap-2 text-muted" aria-label="Breadcrumb">
            <Link href="/shop" className="link-underline">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="link-underline">{product.category}</Link>
          </nav>
          {product.edition && <p className="eyebrow mb-4 text-ember">{product.edition}</p>}
          <RevealLines key={product.slug} as="h1" immediate className="text-display text-7xl md:text-8xl" lines={product.name.split(" ")} />
          <FadeUp delay={0.3}>
            <p className="text-display mt-6 text-3xl italic text-muted">{product.tagline}</p>
            <p className="mt-10 font-mono text-2xl">{money(product.priceCents)}</p>
            <p className="mt-8 max-w-lg leading-relaxed text-ink/80">{product.description}</p>
          </FadeUp>
          <FadeUp delay={0.45} className="mt-12">
            <AddToBag productId={product.id} stock={product.stock} />
          </FadeUp>
          <FadeUp delay={0.55} className="mt-16">
            <Details
              items={[
                ["Material", product.details.material],
                ["Dimensions", product.details.dimensions],
                ["Care", product.details.care],
                ["Shipping", "Wrapped by hand in recycled paper. Ships in 2–3 days. Free standard shipping over $150."],
              ]}
            />
          </FadeUp>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-4 py-32 md:px-8">
          <div className="mb-12 flex items-end justify-between">
            <RevealLines className="text-display text-6xl md:text-7xl" lines={["Kindred objects"]} />
            <Link href={`/shop?category=${product.category}`} className="eyebrow link-underline">All {product.category} →</Link>
          </div>
          <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <FadeUp key={p.id} delay={i * 0.08}>
                <ProductCard product={p} uid={`rel-${p.slug}`} />
              </FadeUp>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
