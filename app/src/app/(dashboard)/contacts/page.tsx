import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contacts" };

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContacts } from "@/lib/demo/contacts";
import { filterRecords, buildScopeFilter } from "@/lib/scope-filter";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cookieStore = await cookies();
  const rawActiveOrg = cookieStore.get("active-org")?.value;
  const orgAliasesFromSession = Object.keys(session.organization ?? {});
  const activeOrg = (rawActiveOrg === "__all__" || (rawActiveOrg && orgAliasesFromSession.includes(rawActiveOrg)))
    ? rawActiveOrg
    : orgAliasesFromSession[0] ?? "__all__";

  const allContacts = getContacts();
  const orgAliases = Object.keys(session.organization ?? {});
  const filter = buildScopeFilter({
    activeOrg,
    userId: session.user.id ?? "",
    userRole: session.orgRole ?? "member",
    userOrgIds: orgAliases,
  });
  const contacts = filterRecords(allContacts, filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link
          href="/contacts/new"
          className="inline-flex h-9 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          + Nouveau contact
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-900">
              <th className="px-4 py-3 text-left font-medium">Nom</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Entreprise</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              {activeOrg === "__all__" && (
                <th className="px-4 py-3 text-left font-medium">Org</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                    {contact.firstName} {contact.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{contact.email}</td>
                <td className="px-4 py-3">{contact.company}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={contact.status} />
                </td>
                {activeOrg === "__all__" && (
                  <td className="px-4 py-3 text-gray-500">{contact.orgId}</td>
                )}
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={activeOrg === "__all__" ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                  Aucun contact
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    lead: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    prospect: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    client: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
