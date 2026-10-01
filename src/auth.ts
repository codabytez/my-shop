import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { sendWelcomeEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials come from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
  providers: [Google],
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
  trustHost: true,
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      try {
        await sendWelcomeEmail({ to: user.email, name: user.name ?? null });
      } catch (err) {
        console.error("[auth] welcome email failed", err);
      }
    },
  },
});
