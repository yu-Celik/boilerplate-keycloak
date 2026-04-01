import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tâches" };

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTasks } from "@/lib/demo/tasks";
import { filterRecords, buildScopeFilter } from "@/lib/scope-filter";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cookieStore = await cookies();
  const rawActiveOrg = cookieStore.get("active-org")?.value;
  const orgAliasesFromSession = Object.keys(session.organization ?? {});
  const activeOrg = (rawActiveOrg === "__all__" || (rawActiveOrg && orgAliasesFromSession.includes(rawActiveOrg)))
    ? rawActiveOrg
    : orgAliasesFromSession[0] ?? "__all__";

  const allTasks = getTasks();
  const orgAliases = Object.keys(session.organization ?? {});
  const filter = buildScopeFilter({
    activeOrg,
    userId: session.user.id ?? "",
    userRole: session.orgRole ?? "member",
    userOrgIds: orgAliases,
  });
  const tasks = filterRecords(allTasks, filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tâches</h1>
        <Link
          href="/tasks/new"
          className="inline-flex h-9 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          + Nouvelle tâche
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-900">
              <th className="px-4 py-3 text-left font-medium">Titre</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Priorité</th>
              <th className="px-4 py-3 text-left font-medium">Échéance</th>
              {activeOrg === "__all__" && (
                <th className="px-4 py-3 text-left font-medium">Org</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-4 py-3">
                  <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3 text-gray-500">{task.dueDate}</td>
                {activeOrg === "__all__" && (
                  <td className="px-4 py-3 text-gray-500">{task.orgId}</td>
                )}
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={activeOrg === "__all__" ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                  Aucune tâche
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };
  const labels: Record<string, string> = { todo: "À faire", in_progress: "En cours", done: "Terminé" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "text-gray-500",
    medium: "text-yellow-600 dark:text-yellow-400",
    high: "text-red-600 dark:text-red-400",
  };
  const labels: Record<string, string> = { low: "Basse", medium: "Moyenne", high: "Haute" };
  return <span className={`text-xs font-medium ${colors[priority] ?? ""}`}>{labels[priority] ?? priority}</span>;
}
