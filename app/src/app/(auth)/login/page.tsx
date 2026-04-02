import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginRedirect } from "./login-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  // If there's an auth error or broken session, destroy the local session
  // and fall through to LoginRedirect (which sends the user to KC login).
  // IMPORTANT: Do NOT redirect to /api/auth/logout here — that creates an
  // infinite redirect loop (/login -> /api/auth/logout -> KC -> /login).
  if (session?.error || params.error) {
    await signOut({ redirect: false });
    // After signOut the cookie is cleared; fall through to LoginRedirect below.
  }

  // Already authenticated with valid session (and no error)
  if (session?.user && !session.error && !params.error) {
    const org = session.organization;
    const hasOrg =
      org !== undefined &&
      org !== null &&
      typeof org === "object" &&
      Object.keys(org).length > 0;

    if (hasOrg) {
      redirect("/");
    } else {
      redirect("/onboarding");
    }
  }

  // Not authenticated — auto-redirect to KC
  return <LoginRedirect />;
}
