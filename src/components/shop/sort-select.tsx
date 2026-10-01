"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["featured", "Featured"],
  ["new", "Newest"],
  ["price-asc", "Price, low to high"],
  ["price-desc", "Price, high to low"],
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="eyebrow flex items-center gap-3">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          const q = new URLSearchParams(params);
          if (e.target.value === "featured") q.delete("sort");
          else q.set("sort", e.target.value);
          router.push(`${pathname}${q.size ? `?${q}` : ""}`, { scroll: false });
        }}
        className="eyebrow cursor-pointer appearance-none bg-transparent pr-2 outline-none"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <span aria-hidden>↓</span>
    </label>
  );
}
