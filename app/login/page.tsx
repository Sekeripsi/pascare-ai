import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginShell from "./login-form";

// Server component: if the user already has a valid session cookie, redirect
// straight to the dashboard instead of showing the login form. This prevents
// the issue where signIn("credentials") fails or behaves unexpectedly when
// there is already an active NextAuth session.
export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <LoginShell />;
}
