import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-bone">
      <div className="grid gap-12 px-4 pb-10 pt-24 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="text-display text-4xl md:text-5xl">
            Slow objects for <em className="text-ember">fast lives</em>.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone/60">
            Every piece is thrown, fired and finished by hand by a small circle of studios across four continents. We make fewer things, better.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-6 md:col-start-7 md:grid-cols-3">
          <FooterCol title="Shop" links={[["All objects", "/shop"], ["Vessels", "/shop?category=Vessels"], ["Light", "/shop?category=Light"], ["Table", "/shop?category=Table"]]} />
          <FooterCol title="Account" links={[["Sign in", "/signin"], ["Orders", "/account"], ["Bag", "/checkout"]]} />
          <FooterCol title="Studio" links={[["Lisbon", "/shop"], ["Kyoto", "/shop"], ["Copenhagen", "/shop"]]} />
        </div>
      </div>
      <div className="flex items-end justify-between px-4 pb-4 md:px-8">
        <p className="eyebrow text-bone/40">© {new Date().getFullYear()} Morrow Objects</p>
        <p className="eyebrow text-bone/40">Made slowly</p>
      </div>
      <p aria-hidden className="text-display pointer-events-none select-none whitespace-nowrap px-2 text-center text-[29vw] leading-[0.75] text-bone/[0.06]">
        Morrow
      </p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-bone/40">{title}</p>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="link-underline text-sm">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
