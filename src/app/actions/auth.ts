"use server";

import { signIn, signOut } from "@/auth";

function safePath(p: FormDataEntryValue | null) {
  const s = typeof p === "string" ? p : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", { redirectTo: safePath(formData.get("redirectTo")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
