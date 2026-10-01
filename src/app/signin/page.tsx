import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RevealLines } from "@/components/motion/reveal";
import { ShaderCanvas } from "@/components/motion/shader-canvas";
import { GoogleButton } from "@/components/shop/google-button";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email is already linked to another sign-in method.",
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Sign-in isn't configured yet. Check the Google OAuth credentials.",
};

export default async function SignInPage(props: PageProps<"/signin">) {
  const sp = await props.searchParams;
  const from = typeof sp.from === "string" ? sp.from : typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/account";
  const redirectTo = from.startsWith("/") && !from.startsWith("//") ? from : "/account";
  if ((await auth())?.user) redirect(redirectTo);
  const error = typeof sp.error === "string" ? (ERRORS[sp.error] ?? "Something went wrong signing you in.") : null;

  return (
    <section className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-bone md:block">
        <ShaderCanvas className="absolute inset-0 h-full w-full" colors={["#0f0d0c", "#2a1a12", "#c4552d", "#e9b97a"]} />
        <div className="relative flex h-full flex-col justify-end p-8">
          <p className="text-display max-w-lg text-5xl italic">
            “The pot is finished when the fire says so, not before.”
          </p>
          <p className="eyebrow mt-6 text-bone/60">— Studio saying, Mashiko</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-4 py-32 md:px-16 lg:px-24">
        <p className="eyebrow mb-6 text-muted">( Account )</p>
        <RevealLines as="h1" immediate className="text-display text-[18vw] md:text-[7vw]" lines={["Welcome", <em key="b" className="text-ember">back.</em>]} />
        <p className="mt-8 max-w-sm leading-relaxed text-muted">
          Sign in to check out, follow your orders and keep your bag across devices. One tap, no passwords.
        </p>
        <div className="mt-12 max-w-sm">
          <GoogleButton redirectTo={redirectTo} />
          {error && <p className="mt-4 text-sm text-ember">{error}</p>}
          <p className="mt-6 text-xs leading-relaxed text-muted">
            We only use your name and email to manage orders. We&apos;ll never post anything or share your details.
          </p>
        </div>
      </div>
    </section>
  );
}
