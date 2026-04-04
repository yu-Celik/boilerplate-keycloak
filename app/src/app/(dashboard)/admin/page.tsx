import { getAllOrganizationsWithStats } from "@/features/admin/lib/platform-admin";
import { suspendOrg, reactivateOrg } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminPage() {
  let orgs: Awaited<ReturnType<typeof getAllOrganizationsWithStats>> = [];
  try {
    orgs = await getAllOrganizationsWithStats();
  } catch {
    // Admin API unavailable
  }

  const totalUsers = orgs.reduce((sum, o) => sum + o.memberCount, 0);
  const activeOrgs = orgs.filter((o) => o.enabled !== false).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Platform</h1>
        <p className="text-muted-foreground">
          Manage all organizations across the platform
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Organizations</p>
            <p className="mt-1 text-3xl font-bold">{orgs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="mt-1 text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Organizations</p>
            <p className="mt-1 text-3xl font-bold">{activeOrgs}</p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              orgs.map((org) => {
                const enabled = org.enabled !== false;
                const plan = org.attributes?.plan?.[0] ?? "free";
                return (
                  <TableRow key={org.id}>
                    <TableCell className="text-sm font-medium">{org.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{org.alias}</TableCell>
                    <TableCell className="text-sm">{org.memberCount}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="secondary">{plan}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {enabled ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex gap-2">
                        {enabled ? (
                          <form action={suspendOrg.bind(null, org.id)}>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              Suspend
                            </Button>
                          </form>
                        ) : (
                          <form action={reactivateOrg.bind(null, org.id)}>
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white dark:text-green-400 dark:hover:text-white"
                            >
                              Reactivate
                            </Button>
                          </form>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
