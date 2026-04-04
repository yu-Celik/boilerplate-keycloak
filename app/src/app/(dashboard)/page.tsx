import { auth } from "@/features/auth/lib/auth";
import { listOrganizations } from "@/features/organization/lib/organization-admin";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Organization
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {orgDetails?.name || currentOrg?.[0] || "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Organization ID
            </h3>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-muted-foreground">
              {currentOrg?.[1]?.id || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Email
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{session?.user?.email}</p>
          </CardContent>
        </Card>
      </div>

      {process.env.NODE_ENV === "development" && currentOrg && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Organization JWT Claims (dev only)</h3>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(session?.organization, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
