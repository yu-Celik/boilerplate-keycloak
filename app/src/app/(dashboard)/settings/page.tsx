import { auth } from "@/lib/auth";
import { listOrganizations, getOrganization } from "@/lib/keycloak-admin";
import type { Organization } from "@/types";

export default async function SettingsPage() {
  const session = await auth();

  let org: Organization | null = null;

  try {
    const orgs = await listOrganizations();
    if (orgs.length > 0) {
      org = await getOrganization(orgs[0].id);
    }
  } catch {
    // Admin API may not be available
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Organization settings</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Organization Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="mt-1 text-lg">{org?.name || "N/A"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Alias
            </label>
            <p className="mt-1 font-mono text-sm">{org?.alias || "N/A"}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              ID
            </label>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {org?.id || "N/A"}
            </p>
          </div>

          {org?.domains && org.domains.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Domains
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {org.domains.map((d) => (
                  <span
                    key={d.name}
                    className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {d.name}
                    {d.verified && (
                      <span className="ml-1 text-green-500">&#10003;</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-destructive/50 bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-destructive">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          These actions are irreversible. Proceed with caution.
        </p>
        <button
          disabled
          className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive opacity-50"
        >
          Leave Organization (not implemented)
        </button>
      </div>
    </div>
  );
}
