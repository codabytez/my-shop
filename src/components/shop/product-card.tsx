import Link from "next/link";
import { ObjectArt } from "@/components/object-art";
import type { Product } from "@/db/schema";
import { money } from "@/lib/format";
import { QuickAdd } from "./quick-add";

export function ProductCard({ product, index, uid }: { product: Product; index?: number; uid: string }) {
  const soldOut = product.stock < 1;
  const href = `/product/${product.slug}`;
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[2px]">
        <Link href={href} data-cursor="view" className="block" tabIndex={-1} aria-hidden>
          <ObjectArt
            uid={uid}
            shape={product.shape}
            palette={product.palette}
            title={product.name}
            className="aspect-[4/5] w-full transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </Link>
        {typeof index === "number" && (
          <span className="eyebrow pointer-events-none absolute left-4 top-4 text-bone mix-blend-difference">{String(index + 1).padStart(2, "0")}</span>
        )}
        {product.edition && !soldOut && (
          <span className="eyebrow pointer-events-none absolute right-4 top-4 rounded-full bg-paper/80 px-3 py-1.5 text-[10px] backdrop-blur">{product.edition}</span>
        )}
        {soldOut ? (
          <span className="eyebrow pointer-events-none absolute right-4 top-4 rounded-full bg-ink px-3 py-1.5 text-[10px] text-bone">Sold out</span>
        ) : (
          <QuickAdd productId={product.id} name={product.name} />
        )}
      </div>
      <Link href={href} data-cursor="view" className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-display text-[28px] leading-none">{product.name}</h3>
          <p className="mt-2 text-sm text-muted">{product.tagline}</p>
        </div>
        <p className="font-mono text-sm">{money(product.priceCents)}</p>
      </Link>
    </article>
  );
}
