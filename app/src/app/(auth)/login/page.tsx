import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginRedirect } from "./login-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  // If there's an auth error or broken session, clear it via logout API
  if (session?.error || params.error) {
    redirect("/api/auth/logout");
  }

  // Already authenticated with valid session
  if (session?.user) {
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
