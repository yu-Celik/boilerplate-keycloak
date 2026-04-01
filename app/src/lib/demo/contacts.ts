export interface Contact {
  id: string;
  orgId: string;
  assignedTo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: "lead" | "prospect" | "client" | "lost";
  createdAt: string;
  updatedAt: string;
}

// In-memory store — resets on server restart
const contacts: Contact[] = [
  {
    id: "c1",
    orgId: "demo-org",
    assignedTo: "user@demo.com",
    firstName: "Alice",
    lastName: "Martin",
    email: "alice@example.com",
    phone: "+33 6 12 34 56 78",
    company: "Acme Corp",
    status: "client",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-15",
  },
  {
    id: "c2",
    orgId: "demo-org",
    assignedTo: "user@demo.com",
    firstName: "Bob",
    lastName: "Dupont",
    email: "bob@startup.io",
    phone: "+33 6 98 76 54 32",
    company: "StartupIO",
    status: "prospect",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-20",
  },
  {
    id: "c3",
    orgId: "demo-org",
    assignedTo: "admin@demo.com",
    firstName: "Claire",
    lastName: "Moreau",
    email: "claire@bigcorp.fr",
    phone: "+33 1 23 45 67 89",
    company: "BigCorp",
    status: "lead",
    createdAt: "2026-03-25",
    updatedAt: "2026-03-25",
  },
];

let nextId = 4;

export function getContacts(): Contact[] {
  return contacts;
}

export function getContact(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Contact {
  const now = new Date().toISOString().split("T")[0];
  const contact: Contact = {
    ...data,
    id: `c${nextId++}`,
    createdAt: now,
    updatedAt: now,
  };
  contacts.push(contact);
  return contact;
}
