export function Marquee({
  items,
  duration = 30,
  className,
  separator = "✺",
}: {
  items: string[];
  duration?: number;
  className?: string;
  separator?: string;
}) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[0.35em]">{t}</span>
          <span className="px-[0.35em] text-ember">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
