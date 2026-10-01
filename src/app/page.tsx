import Link from "next/link";
import { Categories } from "@/components/home/categories";
import { HorizontalGallery } from "@/components/home/horizontal-gallery";
import { Hero } from "@/components/home/hero";
import { Manifesto } from "@/components/home/manifesto";
import { Process } from "@/components/home/process";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { RevealLines } from "@/components/motion/reveal";
import { CATEGORIES, featuredProducts, listProducts } from "@/lib/catalog";

const BLURBS: Record<string, string> = {
  Vessels: "Amphorae, bottles and cylinders for single stems and long silences.",
  Light: "Porcelain domes that warm a room the way late sun does.",
  Table: "Cups, bowls and plates for the rituals you repeat every day.",
  Objects: "Things with no purpose at all, which is precisely the point.",
};

export default async function Home() {
  const [featured, all] = await Promise.all([featuredProducts(), listProducts()]);
  const heroProduct = featured[0] ?? all[0] ?? null;

  const categories = CATEGORIES.map((name) => {
    const items = all.filter((p) => p.category === name);
    const cover = items[0];
    return {
      name,
      count: items.length,
      blurb: BLURBS[name],
      cover: cover ? { shape: cover.shape, palette: cover.palette } : null,
    };
  });

  return (
    <>
      <Hero hero={heroProduct && { shape: heroProduct.shape, palette: heroProduct.palette, name: heroProduct.name, slug: heroProduct.slug }} />

      <div className="border-y border-ink/10 bg-bone py-6">
        <Marquee
          className="text-display text-6xl md:text-8xl"
          duration={40}
          items={["Hand thrown", "Small batch", "Fired at 1280°", "Signed by the maker", "Shipped worldwide", "Made to outlast"]}
        />
      </div>

      <Manifesto />

      {featured.length > 0 && <HorizontalGallery products={featured} />}

      <Categories categories={categories} />

      <Process />

      <section className="relative overflow-hidden bg-ember px-4 py-32 text-ink md:px-8 md:py-48">
        <Marquee className="text-display absolute inset-x-0 top-8 text-[10vw] text-ink/10" duration={60} separator="·" items={["Begin", "your", "collection"]} />
        <div className="relative flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <RevealLines className="text-display text-[17vw] md:text-[10vw]" lines={["Begin your", <em key="c">collection.</em>]} />
          <Magnetic strength={0.4}>
            <Link
              href="/shop"
              data-cursor-label="Shop"
              className="group relative grid h-44 w-44 place-items-center overflow-hidden rounded-full bg-ink text-bone md:h-56 md:w-56"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-paper transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0" />
              <span className="eyebrow relative transition-colors duration-500 group-hover:text-ink">Shop now →</span>
            </Link>
          </Magnetic>
        </div>
      </section>
    </>
  );
}
