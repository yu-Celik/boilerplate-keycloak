import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.platformRole !== "platform-admin") {
    redirect("/");
  }

  return <>{children}</>;
}
