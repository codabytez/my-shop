import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { auth } from "@/auth";
import { Cursor } from "@/components/motion/cursor";
import { Preloader } from "@/components/motion/preloader";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CartProvider } from "@/components/shop/cart-context";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { Footer } from "@/components/shop/footer";
import { Nav } from "@/components/shop/nav";
import { getCart } from "@/lib/cart";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Morrow — Objects for slow mornings", template: "%s — Morrow" },
  description:
    "Hand-thrown ceramics, light and table objects, made in small batches by independent studios.",
  openGraph: { siteName: "Morrow", type: "website" },
};

export const viewport: Viewport = { themeColor: "#141311" };

const introScript = `try{if(sessionStorage.getItem("morrow:intro")==="1")document.documentElement.dataset.intro="seen"}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [session, cart] = await Promise.all([auth(), getCart()]);
  const user = session?.user ? { name: session.user.name ?? null, image: session.user.image ?? null } : null;

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <SmoothScroll>
          <CartProvider cart={cart}>
            <Nav user={user} />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </SmoothScroll>
        <Preloader />
        <Cursor />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
