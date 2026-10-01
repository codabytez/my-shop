import { FadeUp, RevealLines } from "@/components/motion/reveal";

const STEPS = [
  {
    n: "01",
    title: "Throw",
    body: "Every piece begins as a wet kilogram of clay on a wheel. A good potter throws forty a day; a great one keeps six.",
  },
  {
    n: "02",
    title: "Fire",
    body: "Two firings, the second climbing to 1280° over fourteen hours. Glazes melt, run and pool — the kiln has the final say.",
  },
  {
    n: "03",
    title: "Finish",
    body: "Feet are sanded, rims checked, and every object is signed. Then it's wrapped in recycled paper and sent to you.",
  },
];

export function Process() {
  return (
    <section className="grid gap-16 px-4 py-32 md:grid-cols-12 md:px-8">
      <div className="md:col-span-5">
        <div className="md:sticky md:top-32">
          <p className="eyebrow mb-6 text-muted">( Process )</p>
          <RevealLines className="text-display text-7xl md:text-8xl" lines={["Fourteen", <em key="h" className="text-ember">hours</em>, "in the fire"]} />
        </div>
      </div>
      <ol className="md:col-span-6 md:col-start-7">
        {STEPS.map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.05}>
            <li className="grid grid-cols-[auto_1fr] gap-x-8 border-t border-line py-12">
              <span className="text-display text-8xl leading-none text-ember md:text-9xl">{s.n}</span>
              <div className="self-end">
                <h3 className="text-display text-5xl">{s.title}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          </FadeUp>
        ))}
      </ol>
    </section>
  );
}
