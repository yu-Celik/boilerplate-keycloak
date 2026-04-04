import freeEmailDomains from "free-email-domains";

const freeDomainsSet = new Set<string>(freeEmailDomains);

export function extractDomain(email: string): string {
  const parts = email.split("@");
  return parts[parts.length - 1].toLowerCase();
}

export function isPublicDomain(domain: string): boolean {
  return freeDomainsSet.has(domain.toLowerCase());
}

export function suggestOrgName(email: string): string | null {
  const domain = extractDomain(email);
  if (isPublicDomain(domain)) return null;

  // "finanssor.fr" → "Finanssor"
  const name = domain.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}
