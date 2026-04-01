import { auth } from "@/lib/auth";
import { listOrganizations } from "@/lib/keycloak-admin";

export default async function DashboardPage() {
  const session = await auth();

  const orgEntries = session?.organization
    ? Object.entries(session.organization)
    : [];
  const currentOrg = orgEntries[0];

  let orgDetails = null;
  try {
    const orgs = await listOrganizations();
    orgDetails = orgs.find(
      (o: { alias: string }) => o.alias === currentOrg?.[0]
    );
  } catch {
    // KC Admin API may not be available yet
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Organization
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {orgDetails?.name || currentOrg?.[0] || "None"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Organization ID
          </h3>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {currentOrg?.[1]?.id || "N/A"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Your Email
          </h3>
          <p className="mt-2 text-lg">{session?.user?.email}</p>
        </div>
      </div>

      {currentOrg && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-2 font-semibold">Organization JWT Claims</h3>
          <pre className="overflow-auto rounded bg-muted p-4 text-sm">
            {JSON.stringify(session?.organization, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
