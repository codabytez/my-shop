import type { ProductPalette, ProductShape } from "@/db/schema";
import { darken, lighten, mix } from "@/lib/color";

type Props = {
  shape: ProductShape;
  palette: ProductPalette;
  /** Unique per rendered instance so SVG defs never collide. */
  uid: string;
  className?: string;
  /** Hide the studio backdrop (for use on coloured surfaces). */
  bare?: boolean;
  title?: string;
};

/**
 * Procedurally "photographed" ceramics. Every product is rendered as a lit
 * studio still from its shape + glaze palette, so the catalogue never depends
 * on stock photography and stays perfectly art-directed.
 */
export function ObjectArt({ shape, palette, uid, className, bare, title }: Props) {
  const id = (k: string) => `${uid}-${k}`;
  const { bg, body, accent } = palette;

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={title ?? `${shape} object`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={id("spot")} cx="50%" cy="28%" r="75%">
          <stop offset="0%" stopColor={lighten(bg, 0.22)} />
          <stop offset="55%" stopColor={bg} />
          <stop offset="100%" stopColor={darken(bg, 0.12)} />
        </radialGradient>
        <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={darken(bg, 0.04)} stopOpacity="0" />
          <stop offset="100%" stopColor={darken(bg, 0.18)} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={darken(body, 0.38)} />
          <stop offset="22%" stopColor={body} />
          <stop offset="38%" stopColor={lighten(body, 0.28)} />
          <stop offset="55%" stopColor={body} />
          <stop offset="85%" stopColor={darken(body, 0.32)} />
          <stop offset="100%" stopColor={mix(darken(body, 0.25), bg, 0.25)} />
        </linearGradient>
        <linearGradient id={id("bounce")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.10" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="88%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <radialGradient id={id("orb")} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor={lighten(body, 0.42)} />
          <stop offset="35%" stopColor={body} />
          <stop offset="80%" stopColor={darken(body, 0.42)} />
          <stop offset="100%" stopColor={mix(darken(body, 0.3), bg, 0.3)} />
        </radialGradient>
        <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={lighten(body, 0.3)} stopOpacity="0.75" />
          <stop offset="100%" stopColor={body} stopOpacity="0" />
        </radialGradient>
        <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={id("tex")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed={uid.length} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.9" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {!bare && (
        <>
          <rect width="400" height="500" fill={`url(#${id("spot")})`} />
          <rect y="330" width="400" height="170" fill={`url(#${id("floor")})`} />
        </>
      )}

      {/* cast + contact shadows */}
      <ellipse cx="214" cy="424" rx={shadowWidth(shape)} ry="16" fill={darken(bg, 0.55)} opacity="0.45" filter={`url(#${id("blur")})`} />
      <ellipse cx="200" cy="420" rx={shadowWidth(shape) * 0.72} ry="5" fill={darken(bg, 0.7)} opacity="0.55" filter={`url(#${id("soft")})`} />

      <g className="origin-[200px_420px] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:scale-[1.015]">
        <Shape shape={shape} body={body} accent={accent} bg={bg} id={id} />
      </g>
    </svg>
  );
}

function shadowWidth(shape: ProductShape) {
  return { vase: 92, orb: 110, bowl: 140, cylinder: 74, lamp: 70, cup: 92, bottle: 96, stack: 152 }[shape];
}

type ShapeProps = { shape: ProductShape; body: string; accent: string; bg: string; id: (k: string) => string };

function Shaded({ d, id }: { d: string; id: (k: string) => string }) {
  return (
    <>
      <path d={d} fill={`url(#${id("body")})`} />
      <path d={d} fill={`url(#${id("bounce")})`} />
      <path d={d} fill="#000" opacity="0.13" filter={`url(#${id("tex")})`} style={{ mixBlendMode: "multiply" }} />
    </>
  );
}

function Shape({ shape, body, accent, bg, id }: ShapeProps) {
  switch (shape) {
    case "vase": {
      const d =
        "M168 96 L232 96 C232 110 222 118 222 140 C222 176 302 196 302 276 C302 346 256 396 240 420 L160 420 C144 396 98 346 98 276 C98 196 178 176 178 140 C178 118 168 110 168 96 Z";
      return (
        <>
          <Shaded d={d} id={id} />
          <path d="M146 196 C120 230 116 300 140 360" stroke="#fff" strokeOpacity="0.22" strokeWidth="9" fill="none" strokeLinecap="round" filter={`url(#${id("soft")})`} />
          <ellipse cx="200" cy="96" rx="32" ry="7" fill={darken(accent, 0.35)} />
          <ellipse cx="200" cy="96" rx="32" ry="7" fill="none" stroke={lighten(body, 0.2)} strokeWidth="2" />
          <path d="M108 300 C150 318 250 318 292 300" stroke={accent} strokeOpacity="0.55" strokeWidth="5" fill="none" />
        </>
      );
    }
    case "orb":
      return (
        <>
          <circle cx="200" cy="300" r="120" fill={`url(#${id("orb")})`} />
          <circle cx="200" cy="300" r="120" fill="#000" opacity="0.12" filter={`url(#${id("tex")})`} style={{ mixBlendMode: "multiply" }} />
          <ellipse cx="158" cy="246" rx="34" ry="20" fill="#fff" opacity="0.28" transform="rotate(-30 158 246)" filter={`url(#${id("soft")})`} />
          <path d="M96 360 C140 420 260 420 304 360" stroke={lighten(bg, 0.2)} strokeOpacity="0.25" strokeWidth="6" fill="none" filter={`url(#${id("soft")})`} />
        </>
      );
    case "bowl": {
      const d = "M66 300 C66 382 128 420 200 420 C272 420 334 382 334 300 Z";
      return (
        <>
          <Shaded d={d} id={id} />
          <ellipse cx="200" cy="300" rx="134" ry="28" fill={lighten(body, 0.1)} />
          <ellipse cx="200" cy="304" rx="122" ry="22" fill={darken(accent, 0.1)} />
          <ellipse cx="214" cy="310" rx="84" ry="12" fill={accent} opacity="0.7" filter={`url(#${id("soft")})`} />
          <path d="M92 330 C120 380 170 398 200 400" stroke="#fff" strokeOpacity="0.2" strokeWidth="7" fill="none" strokeLinecap="round" filter={`url(#${id("soft")})`} />
        </>
      );
    }
    case "cylinder": {
      const d = "M140 130 L140 412 A60 10 0 0 0 260 412 L260 130 Z";
      return (
        <>
          <Shaded d={d} id={id} />
          <ellipse cx="200" cy="130" rx="60" ry="12" fill={lighten(body, 0.15)} />
          <ellipse cx="200" cy="131" rx="52" ry="9" fill={darken(accent, 0.45)} />
          <rect x="168" y="150" width="7" height="250" rx="3.5" fill="#fff" opacity="0.2" filter={`url(#${id("soft")})`} />
        </>
      );
    }
    case "lamp": {
      const dome = "M86 252 C86 168 138 116 200 116 C262 116 314 168 314 252 Z";
      return (
        <>
          <circle cx="200" cy="230" r="170" fill={`url(#${id("glow")})`} />
          <rect x="192" y="252" width="16" height="152" fill={`url(#${id("body")})`} />
          <rect x="192" y="252" width="16" height="152" fill={darken(accent, 0.2)} opacity="0.55" />
          <ellipse cx="200" cy="410" rx="58" ry="11" fill={darken(accent, 0.25)} />
          <ellipse cx="200" cy="406" rx="58" ry="10" fill={accent} />
          <Shaded d={dome} id={id} />
          <ellipse cx="200" cy="252" rx="114" ry="16" fill={lighten(body, 0.45)} />
          <ellipse cx="200" cy="254" rx="96" ry="10" fill="#fff8e8" opacity="0.85" filter={`url(#${id("soft")})`} />
          <path d="M128 200 C140 160 170 136 200 132" stroke="#fff" strokeOpacity="0.35" strokeWidth="8" fill="none" strokeLinecap="round" filter={`url(#${id("soft")})`} />
        </>
      );
    }
    case "cup": {
      const d = "M134 268 L138 404 A62 14 0 0 0 262 404 L266 268 Z";
      return (
        <>
          <path d="M262 296 C324 292 326 382 260 378" stroke={darken(body, 0.25)} strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M262 296 C318 294 318 378 260 376" stroke={body} strokeWidth="10" fill="none" strokeLinecap="round" />
          <Shaded d={d} id={id} />
          <ellipse cx="200" cy="268" rx="66" ry="14" fill={accent} />
          <ellipse cx="200" cy="270" rx="58" ry="10" fill={darken(body, 0.4)} />
          <path d="M136 272 C150 278 250 278 264 272" stroke={lighten(accent, 0.25)} strokeWidth="3" fill="none" />
          <rect x="160" y="290" width="7" height="100" rx="3.5" fill="#fff" opacity="0.18" filter={`url(#${id("soft")})`} />
        </>
      );
    }
    case "bottle": {
      const d =
        "M186 86 L214 86 L214 198 C214 226 292 236 292 322 C292 380 262 414 246 420 L154 420 C138 414 108 380 108 322 C108 236 186 226 186 198 Z";
      return (
        <>
          <Shaded d={d} id={id} />
          <ellipse cx="200" cy="86" rx="16" ry="4" fill={darken(accent, 0.4)} />
          <rect x="182" y="78" width="36" height="10" rx="3" fill={accent} />
          <path d="M140 270 C124 300 124 350 146 392" stroke="#fff" strokeOpacity="0.2" strokeWidth="8" fill="none" strokeLinecap="round" filter={`url(#${id("soft")})`} />
          {/* drips of salt glaze */}
          <path d="M120 300 C150 290 250 290 280 300 L276 316 C250 306 150 306 124 316 Z" fill={accent} opacity="0.5" />
        </>
      );
    }
    case "stack": {
      const glazes = [darken(accent, 0.05), lighten(body, 0.15), body, lighten(bg, 0.25)];
      return (
        <>
          {glazes.map((g, i) => {
            const y = 400 - i * 26;
            return (
              <g key={i}>
                <ellipse cx="200" cy={y + 9} rx="150" ry="30" fill={darken(g, 0.35)} />
                <ellipse cx="200" cy={y} rx="150" ry="30" fill={g} />
                <ellipse cx="200" cy={y + 2} rx="112" ry="20" fill={darken(g, 0.08)} />
                <ellipse cx="170" cy={y - 8} rx="60" ry="6" fill="#fff" opacity="0.18" filter={`url(#${id("soft")})`} />
              </g>
            );
          })}
        </>
      );
    }
  }
}
