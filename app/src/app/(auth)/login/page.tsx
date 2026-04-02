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

  // If there's an auth error or broken session, sign out first
  if (session?.error || params.error) {
    await signOut({ redirect: false });
  }

  // Already authenticated with valid session
  console.log("[login] session:", JSON.stringify({ user: session?.user, error: session?.error, org: session?.organization }));

  if (session?.user && !session.error) {
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
