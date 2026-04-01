export interface Task {
  id: string;
  orgId: string;
  assignedTo: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory store — resets on server restart
const tasks: Task[] = [
  {
    id: "t1",
    orgId: "demo-org",
    assignedTo: "user@demo.com",
    title: "Configurer le SSO",
    description: "Mettre en place l'authentification SSO avec Keycloak",
    status: "done",
    priority: "high",
    dueDate: "2026-03-15",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-14",
  },
  {
    id: "t2",
    orgId: "demo-org",
    assignedTo: "user@demo.com",
    title: "Créer les pages de gestion",
    description: "Dashboard, membres, invitations",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-04-01",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-28",
  },
  {
    id: "t3",
    orgId: "demo-org",
    assignedTo: "admin@demo.com",
    title: "Rédiger la documentation",
    description: "Guide de démarrage rapide et API reference",
    status: "todo",
    priority: "low",
    dueDate: "2026-04-15",
    createdAt: "2026-03-20",
    updatedAt: "2026-03-20",
  },
];

let nextId = 4;

export function getTasks(): Task[] {
  return tasks;
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt">
): Task {
  const now = new Date().toISOString().split("T")[0];
  const task: Task = {
    ...data,
    id: `t${nextId++}`,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}
