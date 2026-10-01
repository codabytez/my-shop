import Link from "next/link";
import { ObjectArt } from "@/components/object-art";

export default function NotFound() {
  return (
    <section className="grid min-h-screen items-center gap-10 px-4 pt-24 md:grid-cols-2 md:px-8">
      <div>
        <p className="eyebrow mb-6 text-ember">Error 404</p>
        <h1 className="text-display text-[22vw] md:text-[12vw]">
          Cracked<br /><em className="text-muted">in the kiln.</em>
        </h1>
        <p className="mt-8 max-w-sm text-muted">This page didn&apos;t survive the firing. It happens to the best of pots.</p>
        <Link href="/shop" className="eyebrow link-underline mt-10 inline-block">Back to the collection →</Link>
      </div>
      <ObjectArt uid="nf" shape="bowl" palette={{ bg: "#EDE8DF", body: "#C4552D", accent: "#7A2A12" }} bare className="w-full max-w-lg rotate-[8deg]" />
    </section>
  );
}
